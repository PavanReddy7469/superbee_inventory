const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auditLog = require('../middleware/auditLog');

// FIX-07: Validate AE requests items structure to prevent format injections before database execution
exports.validateAERequestItems = (req, res, next) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items must be a non-empty array' });
  }
  for (const item of items) {
    if (!item.part_id || typeof item.part_id !== 'string') {
      return res.status(400).json({ error: 'Each item must have a valid part_id (string)' });
    }
    const qty = Number(item.quantity);
    if (item.quantity === undefined || item.quantity === null || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Each item must have a positive integer quantity' });
    }
  }
  next();
};


// Get all AE requests
exports.getAllRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT * FROM ae_requests
      ORDER BY created_at DESC
    `);
    
    // Parse items JSON
    const formattedRequests = requests.map(req => ({
      ...req,
      items: typeof req.items === 'string' ? JSON.parse(req.items) : req.items
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching AE requests:', error);
    res.status(500).json({ error: 'Failed to fetch AE requests' });
  }
};

// Create new AE request
exports.createRequest = async (req, res) => {
  try {
    const { drone_number, uin_number, items, requested_by, email } = req.body;
    
    if (!drone_number || !uin_number || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const requestId = uuidv4();
    
    await pool.query(
      `INSERT INTO ae_requests (id, drone_number, uin_number, items, requested_by, email, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [requestId, drone_number, uin_number, JSON.stringify(items), requested_by, email]
    );
    
    res.status(201).json({
      message: 'AE request created successfully',
      id: requestId
    });
  } catch (error) {
    console.error('Error creating AE request:', error);
    res.status(500).json({ error: 'Failed to create AE request' });
  }
};

// Accept AE request and decrement inventory
exports.acceptRequest = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Get request details
    // FIX-05: Lock the request row within the transaction using FOR UPDATE to prevent concurrent race conditions
    const [requests] = await connection.query('SELECT * FROM ae_requests WHERE id = ? FOR UPDATE', [id]);
    
    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = requests[0];
    
    // FIX-05: Enforce that request status is strictly 'pending' to prevent double-spend resource decrement attacks
    if (request.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ error: `Request has already been processed (status: ${request.status})` });
    }
    
    // Parse items
    const items = typeof request.items === 'string' ? JSON.parse(request.items) : request.items;
    
    // Decrement inventory for each item
    for (const item of items) {
      // FIX-05: Acquire row-level locks on the target parts to prevent other transactions from modifying them simultaneously
      const [parts] = await connection.query(
        'SELECT quantity FROM inventory_parts WHERE sku = ? FOR UPDATE',
        [item.part_id]
      );
      
      if (parts.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Part ${item.part_id} not found` });
      }
      
      const newQuantity = parts[0].quantity - item.quantity;
      
      // FIX-05: Transaction safety check: Rollback if decrement drops quantity below zero
      if (newQuantity < 0) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Insufficient quantity for part ${item.part_id}. Available: ${parts[0].quantity}, Requested: ${item.quantity}` 
        });
      }
      
      // Update inventory
      await connection.query(
        'UPDATE inventory_parts SET quantity = ? WHERE sku = ?',
        [newQuantity, item.part_id]
      );
    }
    
    // Update request status
    await connection.query(
      'UPDATE ae_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      ['approved', id]
    );
    
    await connection.commit();
    
    // FIX-09: Log request approval to database audit trail
    await auditLog(pool, req, 'APPROVE_AE_REQUEST', 'ae_requests', id, `AE request approved for drone ${request.drone_number}`);
    
    res.json({ message: 'Request accepted and inventory updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error accepting request:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  } finally {
    connection.release();
  }
};

// Reject AE request
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'UPDATE ae_requests SET status = ?, updated_at = NOW() WHERE id = ? AND status = "pending"',
      ['rejected', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
    
    // FIX-09: Log request rejection to database audit trail
    await auditLog(pool, req, 'REJECT_AE_REQUEST', 'ae_requests', id, `AE request rejected`);
    
    res.json({ message: 'Request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
};

// Withdraw AE request
exports.withdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Get request details
    const [requests] = await pool.query('SELECT * FROM ae_requests WHERE id = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = requests[0];

    // FIX-05: Prevent unauthorized request withdrawal. A normal technician can only withdraw their own requests.
    if (request.email !== req.user.email && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. You can only withdraw your own requests.' });
    }
    
    const [result] = await pool.query(
      'UPDATE ae_requests SET status = ?, updated_at = NOW() WHERE id = ? AND status = "pending"',
      ['withdrawn', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
    
    // FIX-09: Log request withdrawal to database audit trail
    await auditLog(pool, req, 'WITHDRAW_AE_REQUEST', 'ae_requests', id, `AE request withdrawn`);
    
    res.json({ message: 'Request withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing request:', error);
    res.status(500).json({ error: 'Failed to withdraw request' });
  }
};
