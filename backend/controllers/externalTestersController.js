const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auditLog = require('../middleware/auditLog');

// Ensure tables exist
async function ensureTablesExist() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS external_testers (
        id VARCHAR(36) PRIMARY KEY,
        dispatch_tag VARCHAR(100) UNIQUE NOT NULL,
        part_id VARCHAR(36) NOT NULL,
        part_name VARCHAR(255) NOT NULL,
        part_sku VARCHAR(100),
        quantity INT NOT NULL DEFAULT 1,
        tester_name VARCHAR(255) NOT NULL,
        tester_phone VARCHAR(50) NOT NULL,
        tester_email VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        dispatch_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expected_return_date DATE,
        returned_date DATETIME,
        status ENUM('testing', 'returned', 'consumed') DEFAULT 'testing',
        remarks TEXT,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (part_id) REFERENCES inventory_parts(id) ON DELETE CASCADE,
        INDEX idx_dispatch_tag (dispatch_tag),
        INDEX idx_status (status),
        INDEX idx_city (city)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.error('Error ensuring external_testers table exists:', err);
  }
}

// Ensure table on load
ensureTablesExist();

// Get all dispatches
exports.getAllDispatches = async (req, res) => {
  try {
    await ensureTablesExist();
    const [dispatches] = await db.query(`
      SELECT et.*, ip.name as current_inventory_name, ip.quantity as current_inventory_qty
      FROM external_testers et
      LEFT JOIN inventory_parts ip ON et.part_id = ip.id
      ORDER BY et.dispatch_date DESC
    `);
    res.json(dispatches);
  } catch (error) {
    console.error('Get external tester dispatches error:', error);
    res.status(500).json({ error: 'Failed to fetch external tester dispatches' });
  }
};

// Get all inventory parts (no pagination) for dropdown
exports.getAllInventoryParts = async (req, res) => {
  try {
    const [parts] = await db.query(`
      SELECT ip.id, ip.name, ip.sku, ip.quantity, c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.is_deleted = FALSE
      ORDER BY ip.name ASC
    `);
    res.json(parts);
  } catch (error) {
    console.error('Get inventory parts for dropdown error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory parts' });
  }
};

// Create new external testing dispatch
exports.createDispatch = async (req, res) => {
  try {
    await ensureTablesExist();
    const {
      part_id, quantity, tester_name, tester_phone, tester_email,
      city, dispatch_date, expected_return_date, remarks
    } = req.body;

    if (!part_id || !quantity || !tester_name || !tester_phone || !tester_email || !city) {
      return res.status(400).json({ error: 'Part, Quantity, Tester Name, Phone, Email, and City are required' });
    }

    const dispatchQty = parseInt(quantity, 10);
    if (isNaN(dispatchQty) || dispatchQty <= 0) {
      return res.status(400).json({ error: 'Valid positive quantity required' });
    }

    // Check inventory stock
    const [parts] = await db.query('SELECT * FROM inventory_parts WHERE id = ? AND is_deleted = FALSE', [part_id]);
    if (parts.length === 0) {
      return res.status(404).json({ error: 'Selected inventory part not found' });
    }

    const targetPart = parts[0];
    if (targetPart.quantity < dispatchQty) {
      return res.status(400).json({
        error: `Insufficient stock for "${targetPart.name}". Available: ${targetPart.quantity}, Requested: ${dispatchQty}`
      });
    }

    // Deduct stock from inventory
    const newQty = targetPart.quantity - dispatchQty;
    await db.query('UPDATE inventory_parts SET quantity = ? WHERE id = ?', [newQty, part_id]);

    const id = uuidv4();
    const dispatch_tag = `SBA-EXT-${Math.floor(100000 + Math.random() * 900000)}`;
    const created_by = req.user?.id || null;

    const formattedDispatchDate = dispatch_date ? new Date(dispatch_date) : new Date();

    await db.query(`
      INSERT INTO external_testers
      (id, dispatch_tag, part_id, part_name, part_sku, quantity, tester_name, tester_phone, tester_email, city, dispatch_date, expected_return_date, status, remarks, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'testing', ?, ?)
    `, [
      id, dispatch_tag, part_id, targetPart.name, targetPart.sku, dispatchQty,
      tester_name.trim(), tester_phone.trim(), tester_email.trim(), city.trim(),
      formattedDispatchDate, expected_return_date || null, remarks || null, created_by
    ]);

    await auditLog(db, req, 'CREATE_EXTERNAL_DISPATCH', 'external_testers', id, `Dispatched ${dispatchQty} units of ${targetPart.name} to ${tester_name} (${city})`);

    const [created] = await db.query('SELECT * FROM external_testers WHERE id = ?', [id]);
    res.status(201).json({
      message: `Successfully dispatched ${dispatchQty} units to ${tester_name} in ${city}`,
      dispatch: created[0]
    });
  } catch (error) {
    console.error('Create external dispatch error:', error);
    res.status(500).json({ error: 'Failed to create external testing dispatch' });
  }
};

// Mark dispatch as Returned (restores quantity back to stock)
exports.markReturned = async (req, res) => {
  try {
    await ensureTablesExist();
    const { id } = req.params;
    const [dispatches] = await db.query('SELECT * FROM external_testers WHERE id = ?', [id]);
    if (dispatches.length === 0) {
      return res.status(404).json({ error: 'Dispatch record not found' });
    }

    const item = dispatches[0];
    if (item.status === 'returned') {
      return res.status(400).json({ error: 'This dispatch has already been returned to stock' });
    }

    // Increment stock in inventory_parts
    const [parts] = await db.query('SELECT quantity FROM inventory_parts WHERE id = ?', [item.part_id]);
    if (parts.length > 0) {
      const restoredQty = parts[0].quantity + item.quantity;
      await db.query('UPDATE inventory_parts SET quantity = ? WHERE id = ?', [restoredQty, item.part_id]);
    }

    // Update dispatch record
    await db.query(`
      UPDATE external_testers
      SET status = 'returned', returned_date = NOW()
      WHERE id = ?
    `, [id]);

    await auditLog(db, req, 'RETURN_EXTERNAL_DISPATCH', 'external_testers', id, `Returned ${item.quantity} units of ${item.part_name} from ${item.tester_name} to stock`);

    const [updated] = await db.query('SELECT * FROM external_testers WHERE id = ?', [id]);
    res.json({
      message: `${item.quantity} units of ${item.part_name} returned back to inventory stock!`,
      dispatch: updated[0]
    });
  } catch (error) {
    console.error('Return external dispatch error:', error);
    res.status(500).json({ error: 'Failed to return dispatch to stock' });
  }
};

// Mark dispatch as Consumed / Damaged
exports.markConsumed = async (req, res) => {
  try {
    await ensureTablesExist();
    const { id } = req.params;
    const [dispatches] = await db.query('SELECT * FROM external_testers WHERE id = ?', [id]);
    if (dispatches.length === 0) {
      return res.status(404).json({ error: 'Dispatch record not found' });
    }

    const item = dispatches[0];
    await db.query(`
      UPDATE external_testers
      SET status = 'consumed'
      WHERE id = ?
    `, [id]);

    await auditLog(db, req, 'CONSUME_EXTERNAL_DISPATCH', 'external_testers', id, `Marked ${item.part_name} dispatched to ${item.tester_name} as consumed/damaged`);

    const [updated] = await db.query('SELECT * FROM external_testers WHERE id = ?', [id]);
    res.json({
      message: `Dispatch marked as consumed/damaged`,
      dispatch: updated[0]
    });
  } catch (error) {
    console.error('Mark consumed error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Delete dispatch record
exports.deleteDispatch = async (req, res) => {
  try {
    await ensureTablesExist();
    const { id } = req.params;
    const [dispatches] = await db.query('SELECT * FROM external_testers WHERE id = ?', [id]);
    if (dispatches.length === 0) {
      return res.status(404).json({ error: 'Dispatch record not found' });
    }

    const item = dispatches[0];
    // If deleted while still in testing, restore stock
    if (item.status === 'testing') {
      const [parts] = await db.query('SELECT quantity FROM inventory_parts WHERE id = ?', [item.part_id]);
      if (parts.length > 0) {
        await db.query('UPDATE inventory_parts SET quantity = ? WHERE id = ?', [parts[0].quantity + item.quantity, item.part_id]);
      }
    }

    await db.query('DELETE FROM external_testers WHERE id = ?', [id]);
    await auditLog(db, req, 'DELETE_EXTERNAL_DISPATCH', 'external_testers', id, `Deleted dispatch record ${item.dispatch_tag}`);

    res.json({ message: 'Dispatch record deleted successfully' });
  } catch (error) {
    console.error('Delete dispatch error:', error);
    res.status(500).json({ error: 'Failed to delete dispatch record' });
  }
};
