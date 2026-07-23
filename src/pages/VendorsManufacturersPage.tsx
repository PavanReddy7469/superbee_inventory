import { useState, useEffect, useMemo } from 'react';
import { inventoryAPI } from '../lib/api';
import { Plus, Search, Edit, Trash2, X, Building2, Store, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VendorsManufacturersPage() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'manufacturers'>('vendors');

  // Lists
  const [vendors, setVendors] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // New Item Input
  const [newItemName, setNewItemName] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemOldName, setEditItemOldName] = useState('');
  const [editItemNewName, setEditItemNewName] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState('');

  // Feedback Toast / Alert
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadOptions = async () => {
    let localMfgs: string[] = [];
    let localVendors: string[] = [];

    try {
      const mStr = localStorage.getItem('saved_manufacturers');
      if (mStr) localMfgs = JSON.parse(mStr);
    } catch (e) {}

    try {
      const vStr = localStorage.getItem('saved_vendors');
      if (vStr) localVendors = JSON.parse(vStr);
    } catch (e) {}

    let dbMfgs: string[] = [];
    let dbVendors: string[] = [];

    try {
      const res = await inventoryAPI.getAll();
      const parts = res.data || [];
      parts.forEach((p: any) => {
        if (p.manufacturer && typeof p.manufacturer === 'string' && p.manufacturer.trim()) {
          dbMfgs.push(p.manufacturer.trim());
        }
        if (p.vendor && typeof p.vendor === 'string' && p.vendor.trim()) {
          dbVendors.push(p.vendor.trim());
        }
      });
    } catch (e) {
      console.error('Error loading DB inventory:', e);
    }

    const combinedM = Array.from(new Set([...localMfgs, ...dbMfgs])).filter(m => m && m !== 'Other').sort();
    const combinedV = Array.from(new Set([...localVendors, ...dbVendors])).filter(v => v && v !== 'Other').sort();

    setManufacturers(combinedM);
    setVendors(combinedV);

    localStorage.setItem('saved_manufacturers', JSON.stringify(combinedM));
    localStorage.setItem('saved_vendors', JSON.stringify(combinedV));
  };

  // Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;

    if (activeTab === 'vendors') {
      if (vendors.some(v => v.toLowerCase() === name.toLowerCase())) {
        showToast('Vendor already exists!', 'error');
        return;
      }
      const updated = [...vendors, name].sort();
      setVendors(updated);
      localStorage.setItem('saved_vendors', JSON.stringify(updated));
      showToast(`Vendor "${name}" added successfully!`);
    } else {
      if (manufacturers.some(m => m.toLowerCase() === name.toLowerCase())) {
        showToast('Manufacturer already exists!', 'error');
        return;
      }
      const updated = [...manufacturers, name].sort();
      setManufacturers(updated);
      localStorage.setItem('saved_manufacturers', JSON.stringify(updated));
      showToast(`Manufacturer "${name}" added successfully!`);
    }

    setNewItemName('');
  };

  // Open Edit Modal
  const openEdit = (name: string) => {
    setEditItemOldName(name);
    setEditItemNewName(name);
    setShowEditModal(true);
  };

  // Save Edit
  const handleSaveEdit = () => {
    const newName = editItemNewName.trim();
    if (!newName) return;

    if (activeTab === 'vendors') {
      const updated = vendors.map(v => (v === editItemOldName ? newName : v)).sort();
      setVendors(updated);
      localStorage.setItem('saved_vendors', JSON.stringify(updated));
      showToast(`Vendor renamed to "${newName}"`);
    } else {
      const updated = manufacturers.map(m => (m === editItemOldName ? newName : m)).sort();
      setManufacturers(updated);
      localStorage.setItem('saved_manufacturers', JSON.stringify(updated));
      showToast(`Manufacturer renamed to "${newName}"`);
    }

    setShowEditModal(false);
  };

  // Open Delete Modal
  const openDelete = (name: string) => {
    setDeleteItemName(name);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (activeTab === 'vendors') {
      const updated = vendors.filter(v => v !== deleteItemName);
      setVendors(updated);
      localStorage.setItem('saved_vendors', JSON.stringify(updated));
      showToast(`Vendor "${deleteItemName}" removed`);
    } else {
      const updated = manufacturers.filter(m => m !== deleteItemName);
      setManufacturers(updated);
      localStorage.setItem('saved_manufacturers', JSON.stringify(updated));
      showToast(`Manufacturer "${deleteItemName}" removed`);
    }

    setShowDeleteModal(false);
  };

  // Active items based on tab & filter
  const currentList = activeTab === 'vendors' ? vendors : manufacturers;
  const filteredList = useMemo(() => {
    return currentList.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [currentList, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard / Manage Vendors & Manufacturers</h1>
        <p className="text-slate-500 text-sm mt-1">
          Add, edit, or update Vendor and Manufacturer names for future selection during part registration.
        </p>
      </div>

      {/* Toast Alert */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between transition-all shadow-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => { setActiveTab('vendors'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'vendors' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Store className="h-4 w-4" />
            Vendors ({vendors.length})
          </button>
          <button
            onClick={() => { setActiveTab('manufacturers'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'manufacturers' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 className="h-4 w-4" />
            Manufacturers ({manufacturers.length})
          </button>
        </div>

        {/* Action Header: Add New & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Add Form */}
          <form onSubmit={handleAddItem} className="flex gap-2 flex-1 max-w-lg">
            <input
              type="text"
              placeholder={`Add new ${activeTab === 'vendors' ? 'vendor' : 'manufacturer'} name...`}
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Add {activeTab === 'vendors' ? 'Vendor' : 'Manufacturer'}
            </button>
          </form>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Filter ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {activeTab === 'vendors' ? 'Vendor Name' : 'Manufacturer Name'}
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredList.length > 0 ? (
                filteredList.map((item, idx) => (
                  <tr key={item} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-400 font-mono w-16">{idx + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900 flex items-center gap-2">
                      {activeTab === 'vendors' ? <Store className="h-4 w-4 text-slate-400" /> : <Building2 className="h-4 w-4 text-slate-400" />}
                      {item}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors text-xs font-medium"
                          title="Edit Name"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => openDelete(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-xs font-medium"
                          title="Remove Name"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-slate-500 text-sm">
                    No {activeTab} found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="bg-yellow-100 p-2.5 rounded-xl">
                <Edit className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit {activeTab === 'vendors' ? 'Vendor' : 'Manufacturer'}
                </h3>
                <p className="text-xs text-slate-400">Update name for future part selections</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {activeTab === 'vendors' ? 'Vendor Name' : 'Manufacturer Name'}
                </label>
                <input
                  type="text"
                  value={editItemNewName}
                  onChange={e => setEditItemNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2.5 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2.5 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete {activeTab === 'vendors' ? 'Vendor' : 'Manufacturer'}
                </h3>
                <p className="text-xs text-slate-400">Remove from future selection options</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to remove <span className="font-semibold text-slate-900">"{deleteItemName}"</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
