const pool = require('../config/database');

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get total buyers (users with technician or admin role, excluding soft-deleted ones)
    const [buyersResult] = await pool.query(`
      SELECT COUNT(*) as count FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('technician', 'admin') AND u.is_deleted = FALSE
    `);
    
    // Get total inventory parts (excluding soft-deleted ones)
    const [inventoryResult] = await pool.query('SELECT COUNT(*) as count FROM inventory_parts WHERE is_deleted = FALSE');
    
    // Get total buyer requests (pending AE requests)
    const [requestsResult] = await pool.query(`
      SELECT COUNT(*) as count FROM ae_requests WHERE status = 'pending'
    `);
    
    res.json({
      totalBuyers: buyersResult[0].count,
      totalInventory: inventoryResult[0].count,
      totalBuyerRequest: requestsResult[0].count
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get products grouped by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.query;
    
    // FIX-20: Exclude soft-deleted parts from counts and listings
    let query = `
      SELECT 
        ip.*,
        c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
      WHERE ip.is_deleted = FALSE
    `;
    
    const params = [];
    if (category_id) {
      query += ' AND ip.category_id = ?';
      params.push(category_id);
    }
    
    query += ' ORDER BY ip.name';
    
    const [parts] = await pool.query(query, params);
    
    res.json(parts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
