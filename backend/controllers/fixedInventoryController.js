const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auditLog = require('../middleware/auditLog');

// Ensure tables exist
async function ensureTablesExist() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS fixed_inventory (
        id VARCHAR(36) PRIMARY KEY,
        asset_tag VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        serial_number VARCHAR(255),
        status ENUM('assigned', 'unassigned', 'maintenance', 'retired') DEFAULT 'unassigned',
        assignee_name VARCHAR(255),
        assignee_phone VARCHAR(50),
        assignee_email VARCHAR(255),
        assigned_date DATE,
        purchase_date DATE,
        price DECIMAL(10, 2) DEFAULT NULL,
        invoice_number VARCHAR(100),
        invoice_url LONGTEXT,
        notes TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_asset_tag (asset_tag),
        INDEX idx_category (category),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS fixed_inventory_history (
        id VARCHAR(36) PRIMARY KEY,
        asset_id VARCHAR(36) NOT NULL,
        from_assignee_name VARCHAR(255),
        from_assignee_email VARCHAR(255),
        from_assignee_phone VARCHAR(50),
        to_assignee_name VARCHAR(255) NOT NULL,
        to_assignee_email VARCHAR(255),
        to_assignee_phone VARCHAR(50),
        transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        remarks TEXT,
        transferred_by VARCHAR(255),
        FOREIGN KEY (asset_id) REFERENCES fixed_inventory(id) ON DELETE CASCADE,
        INDEX idx_asset_id (asset_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.error('Error ensuring fixed_inventory tables exist:', err);
  }
}

// Ensure tables on module load
ensureTablesExist();

// Get all fixed inventory items + history
exports.getAllFixedAssets = async (req, res) => {
  try {
    await ensureTablesExist();
    const [assets] = await db.query(`
      SELECT * FROM fixed_inventory
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);

    // Fetch history records for all assets
    const [histories] = await db.query(`
      SELECT * FROM fixed_inventory_history
      ORDER BY transfer_date DESC
    `);

    // Attach history array to each asset
    const assetsWithHistory = assets.map(asset => {
      const itemHistory = histories.filter(h => h.asset_id === asset.id);
      return { ...asset, history: itemHistory };
    });

    res.json(assetsWithHistory);
  } catch (error) {
    console.error('Get fixed assets error:', error);
    res.status(500).json({ error: 'Failed to fetch fixed inventory' });
  }
};

// Get single asset by ID
exports.getFixedAssetById = async (req, res) => {
  try {
    await ensureTablesExist();
    const [assets] = await db.query(`
      SELECT * FROM fixed_inventory
      WHERE id = ? AND is_deleted = FALSE
    `, [req.params.id]);

    if (assets.length === 0) {
      return res.status(404).json({ error: 'Fixed asset not found' });
    }

    const [history] = await db.query(`
      SELECT * FROM fixed_inventory_history
      WHERE asset_id = ?
      ORDER BY transfer_date DESC
    `, [req.params.id]);

    res.json({ ...assets[0], history });
  } catch (error) {
    console.error('Get fixed asset by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch asset details' });
  }
};

// Create new fixed asset
exports.createFixedAsset = async (req, res) => {
  try {
    await ensureTablesExist();
    const {
      name, category, serial_number, status,
      assignee_name, assignee_phone, assignee_email, assigned_date,
      purchase_date, price, invoice_number, invoice_url, notes
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Asset name and category are required' });
    }

    const id = uuidv4();
    const asset_tag = `SBA-FIX-${Math.floor(100000 + Math.random() * 900000)}`;
    const created_by = req.user?.id || null;

    const initialStatus = assignee_name ? (status || 'assigned') : (status || 'unassigned');
    const initialAssignedDate = assignee_name ? (assigned_date || new Date().toISOString().split('T')[0]) : null;

    await db.query(`
      INSERT INTO fixed_inventory
      (id, asset_tag, name, category, serial_number, status, assignee_name, assignee_phone, assignee_email, assigned_date, purchase_date, price, invoice_number, invoice_url, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, asset_tag, name, category, serial_number || null, initialStatus,
      assignee_name || null, assignee_phone || null, assignee_email || null, initialAssignedDate,
      purchase_date || null, price || null, invoice_number || null, invoice_url || null, notes || null, created_by
    ]);

    // If initially assigned to someone, log initial assignment in history
    if (assignee_name) {
      const historyId = uuidv4();
      await db.query(`
        INSERT INTO fixed_inventory_history
        (id, asset_id, from_assignee_name, from_assignee_email, from_assignee_phone, to_assignee_name, to_assignee_email, to_assignee_phone, remarks, transferred_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        historyId, id, 'Inventory Stock', '-', '-',
        assignee_name, assignee_email || '-', assignee_phone || '-',
        'Initial asset assignment upon registration', req.user?.email || 'Admin'
      ]);
    }

    await auditLog(db, req, 'CREATE_FIXED_ASSET', 'fixed_inventory', id, `Fixed asset ${asset_tag} (${name}) created`);

    const [assets] = await db.query('SELECT * FROM fixed_inventory WHERE id = ?', [id]);
    const [history] = await db.query('SELECT * FROM fixed_inventory_history WHERE asset_id = ? ORDER BY transfer_date DESC', [id]);

    res.status(201).json({
      message: 'Fixed asset registered successfully',
      asset: { ...assets[0], history }
    });
  } catch (error) {
    console.error('Create fixed asset error:', error);
    res.status(500).json({ error: 'Failed to register fixed asset' });
  }
};

// Update fixed asset details
exports.updateFixedAsset = async (req, res) => {
  try {
    await ensureTablesExist();
    const { id } = req.params;
    const {
      name, category, serial_number, status,
      assignee_name, assignee_phone, assignee_email, assigned_date,
      purchase_date, price, invoice_number, invoice_url, notes
    } = req.body;

    const [existing] = await db.query('SELECT * FROM fixed_inventory WHERE id = ? AND is_deleted = FALSE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Fixed asset not found' });
    }

    await db.query(`
      UPDATE fixed_inventory
      SET name = ?, category = ?, serial_number = ?, status = ?,
          assignee_name = ?, assignee_phone = ?, assignee_email = ?, assigned_date = ?,
          purchase_date = ?, price = ?, invoice_number = ?, invoice_url = COALESCE(?, invoice_url), notes = ?
      WHERE id = ?
    `, [
      name, category, serial_number || null, status || existing[0].status,
      assignee_name || null, assignee_phone || null, assignee_email || null, assigned_date || null,
      purchase_date || null, price || null, invoice_number || null, invoice_url || null, notes || null, id
    ]);

    await auditLog(db, req, 'UPDATE_FIXED_ASSET', 'fixed_inventory', id, `Fixed asset ${existing[0].asset_tag} updated`);

    const [assets] = await db.query('SELECT * FROM fixed_inventory WHERE id = ?', [id]);
    const [history] = await db.query('SELECT * FROM fixed_inventory_history WHERE asset_id = ? ORDER BY transfer_date DESC', [id]);

    res.json({
      message: 'Fixed asset updated successfully',
      asset: { ...assets[0], history }
    });
  } catch (error) {
    console.error('Update fixed asset error:', error);
    res.status(500).json({ error: 'Failed to update fixed asset' });
  }
};

// Transfer asset to another employee
exports.transferFixedAsset = async (req, res) => {
  try {
    await ensureTablesExist();
    const { id } = req.params;
    const { to_assignee_name, to_assignee_phone, to_assignee_email, transfer_date, remarks } = req.body;

    if (!to_assignee_name) {
      return res.status(400).json({ error: 'New assignee name is required for transfer' });
    }

    const [existing] = await db.query('SELECT * FROM fixed_inventory WHERE id = ? AND is_deleted = FALSE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Fixed asset not found' });
    }

    const currentAsset = existing[0];
    const fromName = currentAsset.assignee_name || 'Inventory Stock';
    const fromEmail = currentAsset.assignee_email || '-';
    const fromPhone = currentAsset.assignee_phone || '-';

    // Update asset's current assignee
    await db.query(`
      UPDATE fixed_inventory
      SET assignee_name = ?, assignee_phone = ?, assignee_email = ?, assigned_date = ?, status = 'assigned'
      WHERE id = ?
    `, [
      to_assignee_name,
      to_assignee_phone || null,
      to_assignee_email || null,
      transfer_date || new Date().toISOString().split('T')[0],
      id
    ]);

    // Insert history record
    const historyId = uuidv4();
    await db.query(`
      INSERT INTO fixed_inventory_history
      (id, asset_id, from_assignee_name, from_assignee_email, from_assignee_phone, to_assignee_name, to_assignee_email, to_assignee_phone, remarks, transferred_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      historyId, id, fromName, fromEmail, fromPhone,
      to_assignee_name, to_assignee_email || '-', to_assignee_phone || '-',
      remarks || 'Asset transferred to new employee', req.user?.email || 'Admin'
    ]);

    await auditLog(db, req, 'TRANSFER_FIXED_ASSET', 'fixed_inventory', id, `Transferred ${currentAsset.asset_tag} from ${fromName} to ${to_assignee_name}`);

    const [assets] = await db.query('SELECT * FROM fixed_inventory WHERE id = ?', [id]);
    const [history] = await db.query('SELECT * FROM fixed_inventory_history WHERE asset_id = ? ORDER BY transfer_date DESC', [id]);

    res.json({
      message: `Asset transferred to ${to_assignee_name} successfully`,
      asset: { ...assets[0], history }
    });
  } catch (error) {
    console.error('Transfer fixed asset error:', error);
    res.status(500).json({ error: 'Failed to transfer asset' });
  }
};

// Delete fixed asset (soft delete)
exports.deleteFixedAsset = async (req, res) => {
  try {
    await ensureTablesExist();
    const { id } = req.params;
    const [existing] = await db.query('SELECT id, asset_tag FROM fixed_inventory WHERE id = ? AND is_deleted = FALSE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Fixed asset not found' });
    }

    await db.query('UPDATE fixed_inventory SET is_deleted = TRUE WHERE id = ?', [id]);
    await auditLog(db, req, 'DELETE_FIXED_ASSET', 'fixed_inventory', id, `Deleted fixed asset ${existing[0].asset_tag}`);

    res.json({ message: 'Fixed asset deleted successfully' });
  } catch (error) {
    console.error('Delete fixed asset error:', error);
    res.status(500).json({ error: 'Failed to delete fixed asset' });
  }
};
