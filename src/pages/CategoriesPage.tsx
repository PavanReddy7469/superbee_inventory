import { useEffect, useState } from 'react';
import { categoriesAPI } from '../lib/api';
import { Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

const TEXTS = {
  title: 'Dashboard / Manage Categories',
  heading: 'Categories',
  addCategory: 'Add Category',
  editCategory: 'Edit Category',
  name: 'Name',
  status: 'Status',
  action: 'Action',
  description: 'Description',
  active: 'Active',
  inactive: 'Inactive',
  cancel: 'Cancel',
  update: 'Update',
  create: 'Create',
  saving: 'Saving...',
  searchPlaceholder: 'Search:'
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        // Update existing category
        await categoriesAPI.update(editingCategory.id, formData);
        await fetchCategories(); // Refresh
        alert('✅ Category updated successfully!');
      } else {
        // Add new category
        await categoriesAPI.create(formData);
        await fetchCategories(); // Refresh
        alert('✅ Category created successfully!');
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', status: 'active' });
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.error || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      status: category.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesAPI.delete(id);
      await fetchCategories();
      alert('✅ Category deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.error || 'Error deleting category');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{TEXTS.title}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-slate-900">{TEXTS.heading}</h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '', status: 'active' });
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{TEXTS.addCategory}</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={TEXTS.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{TEXTS.name}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{TEXTS.status}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{TEXTS.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{category.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      category.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {category.status === 'active' ? TEXTS.active : TEXTS.inactive}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {editingCategory ? TEXTS.editCategory : TEXTS.addCategory}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{TEXTS.name}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{TEXTS.description}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{TEXTS.status}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">{TEXTS.active}</option>
                    <option value="inactive">{TEXTS.inactive}</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', status: 'active' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {TEXTS.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? TEXTS.saving : (editingCategory ? TEXTS.update : TEXTS.create)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
