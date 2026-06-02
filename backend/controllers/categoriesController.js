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

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category exists
    const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.query(`
      UPDATE categories
      SET name = ?, description = ?, status = ?
      WHERE id = ?
    `, [name, description, status || 'active', id]);

    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({
      message: 'Category updated successfully',
      category: categories[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if any parts are associated with this category
    const [parts] = await db.query('SELECT id FROM inventory_parts WHERE category_id = ?', [id]);
    if (parts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with associated inventory parts. Please reassign or delete the parts first.' 
      });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = exports;
