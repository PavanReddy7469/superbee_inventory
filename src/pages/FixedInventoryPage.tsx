import { useState, useEffect, useMemo, useRef } from 'react';
import { fixedInventoryAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Laptop, Armchair, Tv, Fan, Plus, Search, Eye, Repeat, Edit, Trash2, X,
  FileText, Download, CheckCircle2, AlertCircle, Calendar, User, Phone, Mail,
  History, Clock, PackageCheck, PackageX, DollarSign, ShieldCheck, Tag
} from 'lucide-react';

interface TransferRecord {
  id: string;
  asset_id: string;
  from_assignee_name?: string;
  from_assignee_email?: string;
  from_assignee_phone?: string;
  to_assignee_name: string;
  to_assignee_email?: string;
  to_assignee_phone?: string;
  transfer_date: string;
  remarks?: string;
  transferred_by?: string;
}

interface FixedAsset {
  id: string;
  asset_tag: string;
  name: string;
  category: string;
  serial_number?: string;
  status: 'assigned' | 'unassigned' | 'maintenance' | 'retired';
  assignee_name?: string;
  assignee_phone?: string;
  assignee_email?: string;
  assigned_date?: string;
  purchase_date?: string;
  price?: number;
  invoice_number?: string;
  invoice_url?: string;
  notes?: string;
  created_at: string;
  history?: TransferRecord[];
}

const CATEGORIES = [
  'Laptops & Systems',
  'Monitors & Displays',
  'Furniture (Chairs/Tables)',
  'Office Appliances (Fans/AC/TV)',
  'Peripherals & Networking',
  'Other Office Assets'
];

export default function FixedInventoryPage() {
  const { profile } = useAuth();
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected item states
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    serial_number: '',
    status: 'unassigned' as 'assigned' | 'unassigned' | 'maintenance' | 'retired',
    assignee_name: '',
    assignee_phone: '',
    assignee_email: '',
    assigned_date: new Date().toISOString().split('T')[0],
    purchase_date: '',
    price: '',
    invoice_number: '',
    notes: ''
  });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transfer Form State
  const [transferData, setTransferData] = useState({
    to_assignee_name: '',
    to_assignee_phone: '',
    to_assignee_email: '',
    transfer_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  // Action Loading
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const showToastMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fixedInventoryAPI.getAll();
      setAssets(res.data || []);
    } catch (err) {
      console.error('Error fetching fixed inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert file to Base64 Data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Create Fixed Asset
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let invoiceUrl: string | null = null;
      if (invoiceFile) {
        invoiceUrl = await readFileAsDataURL(invoiceFile);
      }

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        invoice_url: invoiceUrl
      };

      await fixedInventoryAPI.create(payload);
      showToastMsg('Fixed inventory asset registered successfully!');
      setShowAddModal(false);
      resetForm();
      fetchAssets();
    } catch (err: any) {
      console.error('Error creating asset:', err);
      showToastMsg(err.response?.data?.error || 'Failed to register asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEdit = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category,
      serial_number: asset.serial_number || '',
      status: asset.status,
      assignee_name: asset.assignee_name || '',
      assignee_phone: asset.assignee_phone || '',
      assignee_email: asset.assignee_email || '',
      assigned_date: asset.assigned_date ? new Date(asset.assigned_date).toISOString().split('T')[0] : '',
      purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toISOString().split('T')[0] : '',
      price: asset.price !== undefined && asset.price !== null ? String(asset.price) : '',
      invoice_number: asset.invoice_number || '',
      notes: asset.notes || ''
    });
    setInvoiceFile(null);
    setShowEditModal(true);
  };

  // Save Edit Asset
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setActionLoading(true);
    try {
      let invoiceUrl: string | null = selectedAsset.invoice_url || null;
      if (invoiceFile) {
        invoiceUrl = await readFileAsDataURL(invoiceFile);
      }

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        invoice_url: invoiceUrl
      };

      await fixedInventoryAPI.update(selectedAsset.id, payload);
      showToastMsg(`Asset "${formData.name}" updated successfully!`);
      setShowEditModal(false);
      resetForm();
      fetchAssets();
    } catch (err: any) {
      console.error('Error updating asset:', err);
      showToastMsg(err.response?.data?.error || 'Failed to update asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Transfer Modal
  const openTransfer = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setTransferData({
      to_assignee_name: '',
      to_assignee_phone: '',
      to_assignee_email: '',
      transfer_date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setShowTransferModal(true);
  };

  // Execute Transfer
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setActionLoading(true);
    try {
      await fixedInventoryAPI.transfer(selectedAsset.id, transferData);
      showToastMsg(`Asset transferred to ${transferData.to_assignee_name} successfully!`);
      setShowTransferModal(false);
      fetchAssets();
    } catch (err: any) {
      console.error('Error transferring asset:', err);
      showToastMsg(err.response?.data?.error || 'Failed to transfer asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Detail / History Modal
  const openDetail = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  };

  // Open Delete Confirm
  const openDelete = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedAsset) return;
    setActionLoading(true);
    try {
      await fixedInventoryAPI.delete(selectedAsset.id);
      showToastMsg(`Asset ${selectedAsset.asset_tag} deleted`);
      setShowDeleteModal(false);
      fetchAssets();
    } catch (err) {
      console.error('Error deleting asset:', err);
      showToastMsg('Failed to delete asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: CATEGORIES[0],
      serial_number: '',
      status: 'unassigned',
      assignee_name: '',
      assignee_phone: '',
      assignee_email: '',
      assigned_date: new Date().toISOString().split('T')[0],
      purchase_date: '',
      price: '',
      invoice_number: '',
      notes: ''
    });
    setInvoiceFile(null);
    setSelectedAsset(null);
  };

  // Statistics
  const totalAssetsCount = assets.length;
  const assignedCount = useMemo(() => assets.filter(a => a.status === 'assigned' || a.assignee_name).length, [assets]);
  const availableCount = useMemo(() => assets.filter(a => a.status === 'unassigned' && !a.assignee_name).length, [assets]);
  const totalValuation = useMemo(() => assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0), [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.assignee_name && asset.assignee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.assignee_email && asset.assignee_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.assignee_phone && asset.assignee_phone.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
      const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, searchTerm, selectedCategory, statusFilter]);

  // Icon selector by category
  const getCategoryIcon = (category: string) => {
    if (category.includes('Laptops')) return <Laptop className="h-5 w-5 text-indigo-600" />;
    if (category.includes('Monitors')) return <Tv className="h-5 w-5 text-blue-600" />;
    if (category.includes('Furniture')) return <Armchair className="h-5 w-5 text-amber-600" />;
    if (category.includes('Appliances')) return <Fan className="h-5 w-5 text-cyan-600" />;
    return <PackageCheck className="h-5 w-5 text-slate-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard / Fixed Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage office fixed assets (Laptops, PCs, Furniture, Appliances), employee assignments, and complete transfer histories.
          </p>
        </div>
        {profile?.role?.name !== 'technician' && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Fixed Asset
          </button>
        )}
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center justify-between shadow-sm ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
            {toast.text}
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Fixed Assets</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalAssetsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3.5 rounded-xl text-green-600"><PackageCheck className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currently Assigned</p>
            <h3 className="text-2xl font-bold text-slate-900">{assignedCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600"><PackageX className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available / In Stock</p>
            <h3 className="text-2xl font-bold text-slate-900">{availableCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600"><DollarSign className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Valuation</p>
            <h3 className="text-xl font-bold text-slate-900">₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        {/* Search & Category Filter Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${selectedCategory === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Status Dropdown Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search asset, tag, assignee, phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Asset Tag / Name</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Category</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Current Assignee</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Value (₹)</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                    <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading fixed inventory...
                  </td>
                </tr>
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
                          <p className="text-xs font-mono text-indigo-600 font-medium">{asset.asset_tag}</p>
                          {asset.serial_number && <p className="text-[11px] text-slate-400 font-mono">SN: {asset.serial_number}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                        <Tag className="h-3 w-3 text-slate-500" />
                        {asset.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {asset.assignee_name ? (
                        <div>
                          <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-indigo-600" />
                            {asset.assignee_name}
                          </p>
                          {asset.assignee_phone && <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" />{asset.assignee_phone}</p>}
                          {asset.assignee_email && <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" />{asset.assignee_email}</p>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Assigned (In Office Stock)</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        asset.status === 'assigned' || asset.assignee_name ? 'bg-green-100 text-green-700' :
                        asset.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                        asset.status === 'retired' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {asset.status === 'assigned' || asset.assignee_name ? '✓ Assigned' : asset.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-sm font-medium text-slate-900">
                      {asset.price ? `₹${Number(asset.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View & History Timeline */}
                        <button
                          onClick={() => openDetail(asset)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                          title="View Details & History"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>

                        {/* Transfer Asset */}
                        {profile?.role?.name !== 'technician' && (
                          <button
                            onClick={() => openTransfer(asset)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
                            title="Transfer Asset"
                          >
                            <Repeat className="h-3.5 w-3.5" />
                            Transfer
                          </button>
                        )}

                        {/* Edit */}
                        {profile?.role?.name !== 'technician' && (
                          <button
                            onClick={() => openEdit(asset)}
                            className="p-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                            title="Edit Asset"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        {profile?.role?.name !== 'technician' && (
                          <button
                            onClick={() => openDelete(asset)}
                            className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Asset"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No fixed inventory assets found. Click "Add Fixed Asset" to register your office equipment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ADD / EDIT ASSET MODAL
      ══════════════════════════════════════════════════ */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <div className="bg-indigo-100 p-3 rounded-xl"><Laptop className="h-6 w-6 text-indigo-600" /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{showAddModal ? 'Register Fixed Office Asset' : 'Edit Asset Specifications'}</h3>
                <p className="text-xs text-slate-400">Laptops, PCs, Furniture, Appliances & Employee Allocation</p>
              </div>
            </div>

            <form onSubmit={showAddModal ? handleCreateAsset : handleSaveEdit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Asset Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Dell XPS 15 Laptop / Ergonomic Executive Chair"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Category <span className="text-red-500">*</span></label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    required
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. SN-884920192"
                    value={formData.serial_number}
                    onChange={e => setFormData(f => ({ ...f, serial_number: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={e => setFormData(f => ({ ...f, purchase_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Invoice Number */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice / Bill Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2024-99120"
                    value={formData.invoice_number}
                    onChange={e => setFormData(f => ({ ...f, invoice_number: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Invoice Document Upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Product Invoice (PDF, Image)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-400 p-4 rounded-xl text-center cursor-pointer transition-colors bg-slate-50"
                  >
                    <FileText className="h-8 w-8 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-600">
                      {invoiceFile ? <span className="text-indigo-600 font-semibold">{invoiceFile.name}</span> : 'Click or drag file to attach invoice PDF/image'}
                    </p>
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => e.target.files?.[0] && setInvoiceFile(e.target.files[0])} className="hidden" />
                  </div>
                </div>
              </div>

              {/* ── Assignee Section ── */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-600" />
                  Current Assignee / Employee Allocation Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assignee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.assignee_name}
                      onChange={e => setFormData(f => ({ ...f, assignee_name: e.target.value, status: e.target.value ? 'assigned' : 'unassigned' }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assignee Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={formData.assignee_phone}
                      onChange={e => setFormData(f => ({ ...f, assignee_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assignee Email ID</label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@superbee.com"
                      value={formData.assignee_email}
                      onChange={e => setFormData(f => ({ ...f, assignee_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : showAddModal ? 'Register Asset' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TRANSFER ASSET MODAL
      ══════════════════════════════════════════════════ */}
      {showTransferModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-4">
              <div className="bg-purple-100 p-3 rounded-xl"><Repeat className="h-6 w-6 text-purple-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Transfer Fixed Asset</h3>
                <p className="text-xs text-purple-600 font-mono font-medium">{selectedAsset.asset_tag} — {selectedAsset.name}</p>
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              {/* Current Assignee Summary */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Currently Assigned To</p>
                <p className="text-sm font-bold text-slate-800">{selectedAsset.assignee_name || 'Inventory Stock (Unassigned)'}</p>
                {selectedAsset.assignee_email && <p className="text-slate-500">{selectedAsset.assignee_email}</p>}
              </div>

              <div className="space-y-3">
                <p className="font-bold text-slate-700 text-sm">New Assignee Details:</p>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">New Assignee Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={transferData.to_assignee_name}
                    onChange={e => setTransferData(t => ({ ...t, to_assignee_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">New Assignee Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9988776655"
                    value={transferData.to_assignee_phone}
                    onChange={e => setTransferData(t => ({ ...t, to_assignee_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">New Assignee Email ID</label>
                  <input
                    type="email"
                    placeholder="e.g. priya@superbee.com"
                    value={transferData.to_assignee_email}
                    onChange={e => setTransferData(t => ({ ...t, to_assignee_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Transfer Date</label>
                  <input
                    type="date"
                    value={transferData.transfer_date}
                    onChange={e => setTransferData(t => ({ ...t, transfer_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Reason / Remarks for Transfer</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Laptop reassigned upon project transfer..."
                    value={transferData.remarks}
                    onChange={e => setTransferData(t => ({ ...t, remarks: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors text-xs font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DETAILS & TRANSFER HISTORY TIMELINE MODAL
      ══════════════════════════════════════════════════ */}
      {showDetailModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 z-10">
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
              <div className="p-3 bg-indigo-100 rounded-xl">{getCategoryIcon(selectedAsset.category)}</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedAsset.name}</h3>
                <p className="text-xs font-mono text-indigo-600 font-semibold">
                  {selectedAsset.asset_tag} · Category: {selectedAsset.category}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Asset Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Serial Number</span>
                  <span className="font-mono text-slate-800 font-medium">{selectedAsset.serial_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Purchase Date</span>
                  <span className="text-slate-800 font-medium">{selectedAsset.purchase_date ? new Date(selectedAsset.purchase_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Purchase Value (₹)</span>
                  <span className="text-slate-800 font-bold">{selectedAsset.price ? `₹${Number(selectedAsset.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'}</span>
                </div>
              </div>

              {/* Current Assignee Card */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs">
                <h4 className="font-bold text-green-900 text-sm mb-2 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-green-600" /> Current Assignee Details
                </h4>
                {selectedAsset.assignee_name ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><span className="text-green-700 font-semibold block">Name</span><span className="text-slate-800 font-medium">{selectedAsset.assignee_name}</span></div>
                    <div><span className="text-green-700 font-semibold block">Phone Number</span><span className="text-slate-800 font-medium">{selectedAsset.assignee_phone || 'N/A'}</span></div>
                    <div><span className="text-green-700 font-semibold block">Email ID</span><span className="text-slate-800 font-medium">{selectedAsset.assignee_email || 'N/A'}</span></div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Unassigned (Currently in office inventory stock)</p>
                )}
              </div>

              {/* Attached Invoice Viewer Section */}
              {selectedAsset.invoice_url && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-600" /> Product Invoice / Purchase Bill
                  </h4>
                  {selectedAsset.invoice_url.startsWith('data:application/pdf') || selectedAsset.invoice_url.endsWith('.pdf') ? (
                    <iframe
                      src={selectedAsset.invoice_url}
                      title={`Invoice_${selectedAsset.asset_tag}`}
                      className="w-full h-[350px] rounded-xl border border-slate-200 bg-slate-100"
                    />
                  ) : (
                    <div className="w-full max-h-[350px] overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-2 flex items-center justify-center">
                      <img src={selectedAsset.invoice_url} alt="Invoice Document" className="max-w-full h-auto rounded-lg shadow-sm" />
                    </div>
                  )}
                </div>
              )}

              {/* Transfer Audit Trail History Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <History className="h-4 w-4 text-purple-600" />
                  Asset Assignment & Transfer History Log
                </h4>

                {selectedAsset.history && selectedAsset.history.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                    {selectedAsset.history.map((hRecord, index) => (
                      <div key={hRecord.id || index} className="relative pl-8 text-xs">
                        <div className="absolute left-1.5 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center">
                          <Clock className="h-2.5 w-2.5 text-white" />
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                          <div className="flex justify-between items-center text-slate-500 font-semibold border-b border-slate-200 pb-1.5">
                            <span>📅 {new Date(hRecord.transfer_date).toLocaleString()}</span>
                            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono">By: {hRecord.transferred_by || 'Admin'}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-800">
                            <div>
                              <span className="text-slate-400 font-semibold block">From Assignee:</span>
                              <p className="font-medium text-red-700">{hRecord.from_assignee_name || 'Inventory Stock'}</p>
                              <p className="text-[11px] text-slate-500">{hRecord.from_assignee_email}</p>
                            </div>

                            <div>
                              <span className="text-slate-400 font-semibold block">Transferred To:</span>
                              <p className="font-bold text-green-700">{hRecord.to_assignee_name}</p>
                              <p className="text-[11px] text-slate-500">{hRecord.to_assignee_email} · {hRecord.to_assignee_phone}</p>
                            </div>
                          </div>

                          {hRecord.remarks && (
                            <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200 italic mt-1">
                              "{hRecord.remarks}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                    No transfer history records recorded yet for this asset.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 mt-2">
              {selectedAsset.invoice_url && (
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = selectedAsset.invoice_url!;
                    a.download = `Invoice_${selectedAsset.asset_tag}.pdf`;
                    a.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-xs font-medium"
                >
                  <Download className="h-4 w-4" /> Download Invoice
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DELETE ASSET CONFIRM MODAL
      ══════════════════════════════════════════════════ */}
      {showDeleteModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-xl"><Trash2 className="h-6 w-6 text-red-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Fixed Asset</h3>
                <p className="text-xs text-slate-400">{selectedAsset.asset_tag}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to remove <span className="font-semibold text-slate-900">"{selectedAsset.name}"</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
