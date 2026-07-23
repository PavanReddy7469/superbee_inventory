const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auditLog = require('../middleware/auditLog');

// Get all inventory parts (paginated)
exports.getAllParts = async (req, res) => {
  try {
    // FIX-17: Accept query parameters: page (default 1), limit (default 50, max 100)
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 50;
    if (limit > 100) limit = 100;
    if (page < 1) page = 1;
    const offset = (page - 1) * limit;

    // FIX-20: Exclude soft-deleted parts from queries
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM inventory_parts WHERE is_deleted = FALSE');
    const total = countResult[0].count;

    const [parts] = await db.query(`
      SELECT ip.*, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.is_deleted = FALSE
      ORDER BY ip.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalPages = Math.ceil(total / limit);

    // FIX-17: Return paginated response
    res.json({
      data: parts,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

// Get single part
exports.getPartById = async (req, res) => {
  try {
    const [parts] = await db.query(`
      SELECT ip.*, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.id = ? AND ip.is_deleted = FALSE
    `, [req.params.id]);

    if (parts.length === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    res.json(parts[0]);
  } catch (error) {
    console.error('Get part error:', error);
    res.status(500).json({ error: 'Failed to fetch part' });
  }
};

// Create new part
exports.createPart = async (req, res) => {
  try {
    const { sku, name, category_id, manufacturer, vendor, bill_number, serial_number, quantity, price, status, invoice_url } = req.body;

    // Validate required fields
    if (!sku || !name || !category_id) {
      return res.status(400).json({ error: 'SKU, name, and category are required' });
    }

    // Ensure bill_number, vendor, and invoice_url columns exist
    await db.query("ALTER TABLE inventory_parts ADD COLUMN bill_number VARCHAR(255)").catch(() => {});
    await db.query("ALTER TABLE inventory_parts ADD COLUMN vendor VARCHAR(255)").catch(() => {});
    await db.query("ALTER TABLE inventory_parts ADD COLUMN invoice_url LONGTEXT").catch(() => {});

    const id = uuidv4();
    const created_by = req.user.id;

    await db.query(`
      INSERT INTO inventory_parts 
      (id, sku, name, category_id, manufacturer, vendor, bill_number, serial_number, quantity, price, status, invoice_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, sku, name, category_id,
      manufacturer || null, vendor || null, bill_number || null, serial_number || null,
      quantity || 0, price !== undefined && price !== null ? price : null,
      status || 'active', invoice_url || null, created_by
    ]);

    // FIX-09: Log part creation to database audit trail
    await auditLog(db, req, 'CREATE_INVENTORY_PART', 'inventory_parts', id, `Inventory part ${sku} created`);

    // Fetch the created part
    const [parts] = await db.query(`
      SELECT ip.*, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.id = ? AND ip.is_deleted = FALSE
    `, [id]);

    res.status(201).json({
      message: 'Part created successfully',
      part: parts[0]
    });
  } catch (error) {
    console.error('Create part error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to create part' });
  }
};

// Update part
exports.updatePart = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, manufacturer, vendor, bill_number, serial_number, quantity, price, status, invoice_url } = req.body;

    // Ensure bill_number, vendor, and invoice_url columns exist
    await db.query("ALTER TABLE inventory_parts ADD COLUMN bill_number VARCHAR(255)").catch(() => {});
    await db.query("ALTER TABLE inventory_parts ADD COLUMN vendor VARCHAR(255)").catch(() => {});
    await db.query("ALTER TABLE inventory_parts ADD COLUMN invoice_url LONGTEXT").catch(() => {});

    // Check if part exists
    const [existing] = await db.query('SELECT id FROM inventory_parts WHERE id = ? AND is_deleted = FALSE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    await db.query(`
      UPDATE inventory_parts 
      SET name = ?, category_id = ?, manufacturer = ?, vendor = ?, bill_number = ?, serial_number = ?, quantity = ?, price = ?, status = ?, invoice_url = COALESCE(?, invoice_url)
      WHERE id = ?
    `, [name, category_id, manufacturer || null, vendor || null, bill_number || null, serial_number || null, quantity, price, status, invoice_url || null, id]);

    // FIX-09: Log part update to database audit trail
    await auditLog(db, req, 'UPDATE_INVENTORY_PART', 'inventory_parts', id, `Inventory part updated`);

    // Fetch updated part
    const [parts] = await db.query(`
      SELECT ip.*, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.id = ? AND ip.is_deleted = FALSE
    `, [id]);

    res.json({
      message: 'Part updated successfully',
      part: parts[0]
    });
  } catch (error) {
    console.error('Update part error:', error);
    res.status(500).json({ error: 'Failed to update part' });
  }
};

// Delete part
exports.deletePart = async (req, res) => {
  try {
    const { id } = req.params;

    // FIX-20: Soft delete part instead of hard deleting
    const [result] = await db.query('UPDATE inventory_parts SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    // FIX-09: Log part deletion to database audit trail
    await auditLog(db, req, 'DELETE_INVENTORY_PART', 'inventory_parts', id, `Inventory part deleted`);

    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.error('Delete part error:', error);
    res.status(500).json({ error: 'Failed to delete part' });
  }
};

module.exports = exports;
