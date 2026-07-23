const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all send requests (admin view)
exports.getAllRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM send_requests ORDER BY created_at DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching send requests:', error);
    res.status(500).json({ error: 'Failed to fetch send requests' });
  }
};

// Create a new send request (technician)
exports.createRequest = async (req, res) => {
  try {
    const { part_value, part_mode, category_name, website, quantity, requested_by, email, requested_at, notes } = req.body;

    if (!part_value || !website || !quantity) {
      return res.status(400).json({ error: 'Part name/number, website, and quantity are required' });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO send_requests
        (id, part_value, part_mode, category_name, website, quantity, requested_by, email, requested_at, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        part_value.trim(),
        part_mode || 'name',
        category_name || null,
        website.trim(),
        Number(quantity),
        requested_by || 'Unknown',
        email || null,
        requested_at ? new Date(requested_at) : new Date(),
        notes || null
      ]
    );

    res.status(201).json({ message: 'Request submitted successfully', id });
  } catch (error) {
    console.error('Error creating send request:', error);
    res.status(500).json({ error: 'Failed to create send request' });
  }
};

// Update status (admin: approve / reject)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query(`UPDATE send_requests SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error('Error updating send request status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};
