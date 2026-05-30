const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT * FROM categories 
      ORDER BY name ASC
    `);
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const id = uuidv4();
    const created_by = req.user.id;

    await db.query(`
      INSERT INTO categories (id, name, description, status, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [id, name, description, status || 'active', created_by]);

    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    res.status(201).json({
      message: 'Category created successfully',
      category: categories[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

module.exports = exports;
