const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all inventory parts
exports.getAllParts = async (req, res) => {
  try {
    const [parts] = await db.query(`
      SELECT ip.*, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      ORDER BY ip.created_at DESC
    `);

    res.json(parts);
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
      WHERE ip.id = ?
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
    const { sku, name, category_id, manufacturer, serial_number, quantity, price, status } = req.body;

    // Validate required fields
    if (!sku || !name || !category_id) {
      return res.status(400).json({ error: 'SKU, name, and category are required' });
    }

    const id = uuidv4();
    const created_by = req.user.id;

    await db.query(`
      INSERT INTO inventory_parts 
      (id, sku, name, category_id, manufacturer, serial_number, quantity, price, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, sku, name, category_id, manufacturer, serial_number, quantity || 0, price || 0, status || 'active', created_by]);

    // Fetch the created part
    const [parts] = await db.query(`
      SELECT ip.*, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.id = ?
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
    const { name, manufacturer, serial_number, quantity, price, status } = req.body;

    // Check if part exists
    const [existing] = await db.query('SELECT id FROM inventory_parts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    await db.query(`
      UPDATE inventory_parts 
      SET name = ?, manufacturer = ?, serial_number = ?, quantity = ?, price = ?, status = ?
      WHERE id = ?
    `, [name, manufacturer, serial_number, quantity, price, status, id]);

    // Fetch updated part
    const [parts] = await db.query(`
      SELECT ip.*, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.id = ?
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

    const [result] = await db.query('DELETE FROM inventory_parts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.error('Delete part error:', error);
    res.status(500).json({ error: 'Failed to delete part' });
  }
};

module.exports = exports;
