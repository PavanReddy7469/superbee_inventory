const pool = require('../config/database');

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get total buyers (users with technician role)
    const [buyersResult] = await pool.query(`
      SELECT COUNT(*) as count FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('technician', 'admin')
    `);
    
    // Get total inventory parts
    const [inventoryResult] = await pool.query('SELECT COUNT(*) as count FROM inventory_parts');
    
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
    
    let query = `
      SELECT 
        ip.*,
        c.name as category_name
      FROM inventory_parts ip
      LEFT JOIN categories c ON ip.category_id = c.id
    `;
    
    const params = [];
    if (category_id) {
      query += ' WHERE ip.category_id = ?';
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
