import { useState, useEffect, useMemo } from 'react';
import { externalTestersAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Send, Search, User, Phone, Mail, MapPin, Calendar, Clock, RotateCcw,
  CheckCircle2, AlertCircle, Trash2, X, Plus, PackageCheck, FlaskConical,
  Building, Eye, Tag
} from 'lucide-react';

interface ExternalDispatch {
  id: string;
  dispatch_tag: string;
  part_id: string;
  part_name: string;
  part_sku?: string;
  quantity: number;
  tester_name: string;
  tester_phone: string;
  tester_email: string;
  city: string;
  dispatch_date: string;
  expected_return_date?: string;
  returned_date?: string;
  status: 'testing' | 'returned' | 'consumed';
  remarks?: string;
}

interface InventoryPart {
  id: string;
  sku: string;
  name: string;
  quantity: number;
}

export default function ExternalTestersPage() {
  const { profile } = useAuth();
  const [dispatches, setDispatches] = useState<ExternalDispatch[]>([]);
  const [inventoryParts, setInventoryParts] = useState<InventoryPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<ExternalDispatch | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    part_id: '',
    quantity: 1,
    tester_name: '',
    tester_phone: '',
    tester_email: '',
    city: '',
    dispatch_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    expected_return_date: '',
    remarks: ''
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dispRes, invRes] = await Promise.all([
        externalTestersAPI.getAll(),
        externalTestersAPI.getInventoryParts()
      ]);
      setDispatches(Array.isArray(dispRes.data) ? dispRes.data : []);
      setInventoryParts(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err) {
      console.error('Error loading external testers data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedInventoryPart = useMemo(() => {
    return inventoryParts.find(p => p.id === formData.part_id);
  }, [inventoryParts, formData.part_id]);

  // Submit New External Testing Dispatch
  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.part_id) {
      showToast('Please select a part to dispatch', 'error');
      return;
    }
    if (selectedInventoryPart && formData.quantity > selectedInventoryPart.quantity) {
      showToast(`Cannot dispatch ${formData.quantity} units. Available stock is ${selectedInventoryPart.quantity}`, 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await externalTestersAPI.create(formData);
      showToast(res.data.message || 'Part dispatched to external tester successfully!');
      setShowDispatchModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('Error dispatching part:', err);
      showToast(err.response?.data?.error || 'Failed to dispatch part', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark Returned to Stock
  const handleMarkReturned = async (dispatch: ExternalDispatch) => {
    if (!confirm(`Return ${dispatch.quantity} units of "${dispatch.part_name}" from ${dispatch.tester_name} back to inventory stock?`)) return;
    setActionLoading(true);
    try {
      const res = await externalTestersAPI.markReturned(dispatch.id);
      showToast(res.data.message || 'Part returned to inventory stock successfully!');
      fetchData();
    } catch (err: any) {
      console.error('Error returning part:', err);
      showToast(err.response?.data?.error || 'Failed to return part', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Dispatch Record
  const handleConfirmDelete = async () => {
    if (!selectedDispatch) return;
    setActionLoading(true);
    try {
      await externalTestersAPI.delete(selectedDispatch.id);
      showToast(`Dispatch ${selectedDispatch.dispatch_tag} deleted`);
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      console.error('Error deleting dispatch:', err);
      showToast('Failed to delete dispatch record', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      part_id: inventoryParts[0]?.id || '',
      quantity: 1,
      tester_name: '',
      tester_phone: '',
      tester_email: '',
      city: '',
      dispatch_date: new Date().toISOString().slice(0, 16),
      expected_return_date: '',
      remarks: ''
    });
    setSelectedDispatch(null);
  };

  // Stats
  const totalDispatches = dispatches.length;
  const activeTestingCount = useMemo(() => dispatches.filter(d => d.status === 'testing').length, [dispatches]);
  const returnedCount = useMemo(() => dispatches.filter(d => d.status === 'returned').length, [dispatches]);
  const totalCitiesCount = useMemo(() => new Set(dispatches.map(d => d.city.toLowerCase())).size, [dispatches]);

  // Filtered List
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(d => {
      const matchesSearch =
        d.tester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.dispatch_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tester_phone.includes(searchTerm) ||
        d.tester_email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dispatches, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard / External Testers</h1>
          <p className="text-slate-500 text-sm mt-1">
            Dispatch parts for external field testing (Who, Where, When). Stock updates automatically on dispatch and return.
          </p>
        </div>

        {profile?.role?.name !== 'technician' && (
          <button
            onClick={() => { resetForm(); fetchData(); setShowDispatchModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Send className="h-4 w-4" />
            Dispatch Part for Testing
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center justify-between shadow-sm ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
            {toast.text}
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600"><FlaskConical className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Dispatches</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalDispatches}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600"><Clock className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Testing in Progress</p>
            <h3 className="text-2xl font-bold text-slate-900">{activeTestingCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3.5 rounded-xl text-green-600"><PackageCheck className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returned to Stock</p>
            <h3 className="text-2xl font-bold text-slate-900">{returnedCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600"><Building className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Testing Cities</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalCitiesCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${statusFilter === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Dispatches
            </button>
            <button
              onClick={() => setStatusFilter('testing')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${statusFilter === 'testing' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Testing in Progress ({activeTestingCount})
            </button>
            <button
              onClick={() => setStatusFilter('returned')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${statusFilter === 'returned' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Returned ({returnedCount})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tester, city, part..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Dispatch Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Dispatch Tag / Part</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Tester (Who)</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">City (Where)</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Dispatch Date & Time (When)</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading external dispatches...
                  </td>
                </tr>
              ) : filteredDispatches.length > 0 ? (
                filteredDispatches.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.part_name}</p>
                        <span className="font-mono text-[11px] text-indigo-600 font-semibold">{item.dispatch_tag}</span>
                        <span className="ml-2 bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[11px]">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900 flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-indigo-600" />
                          {item.tester_name}
                        </p>
                        <p className="text-slate-500 flex items-center gap-1 text-[11px]"><Phone className="h-3 w-3" />{item.tester_phone}</p>
                        <p className="text-slate-500 flex items-center gap-1 text-[11px]"><Mail className="h-3 w-3" />{item.tester_email}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-medium">
                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                        {item.city}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(item.dispatch_date).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-slate-400">{new Date(item.dispatch_date).toLocaleTimeString()}</p>
                        {item.expected_return_date && (
                          <p className="text-[10px] text-amber-700 font-medium mt-0.5">Exp Return: {new Date(item.expected_return_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'testing' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'returned' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'testing' ? '🧪 Testing in Progress' :
                         item.status === 'returned' ? '✓ Returned to Stock' : '⚠️ Consumed'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Return to stock action */}
                        {item.status === 'testing' && profile?.role?.name !== 'technician' && (
                          <button
                            onClick={() => handleMarkReturned(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium text-xs"
                            title="Return Part to Stock"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Return Stock
                          </button>
                        )}

                        {/* View details */}
                        <button
                          onClick={() => { setSelectedDispatch(item); setShowDetailModal(true); }}
                          className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        {profile?.role?.name !== 'technician' && (
                          <button
                            onClick={() => { setSelectedDispatch(item); setShowDeleteModal(true); }}
                            className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Record"
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
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No external tester dispatches found. Click "Dispatch Part for Testing" to send parts to external testers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          DISPATCH PART MODAL
      ══════════════════════════════════════════════════ */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowDispatchModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-4">
              <div className="bg-indigo-100 p-3 rounded-xl"><Send className="h-6 w-6 text-indigo-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Dispatch Inventory Part to External Tester</h3>
                <p className="text-xs text-slate-400">Specify Who, Where, and When. Available stock auto-deducts upon dispatch.</p>
              </div>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
              {/* Part Selection & Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Select Inventory Part <span className="text-red-500">*</span></label>
                  <select
                    value={formData.part_id}
                    onChange={e => setFormData(f => ({ ...f, part_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                    required
                  >
                    <option value="">-- Choose Inventory Part --</option>
                    {inventoryParts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) — Available Stock: {p.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    max={selectedInventoryPart?.quantity || 999}
                    value={formData.quantity}
                    onChange={e => setFormData(f => ({ ...f, quantity: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                    required
                  />
                  {selectedInventoryPart && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Max Available: {selectedInventoryPart.quantity}</p>
                  )}
                </div>
              </div>

              {/* WHO Section */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <User className="h-4 w-4 text-indigo-600" />
                  WHO (External Tester Information)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Tester Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Verma"
                      value={formData.tester_name}
                      onChange={e => setFormData(f => ({ ...f, tester_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={formData.tester_phone}
                      onChange={e => setFormData(f => ({ ...f, tester_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Email ID <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@testinglab.com"
                      value={formData.tester_email}
                      onChange={e => setFormData(f => ({ ...f, tester_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* WHERE Section */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <MapPin className="h-4 w-4 text-red-500" />
                  WHERE (Location / City)
                </h4>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">City / Testing Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore / Hyderabad R&D Facility"
                    value={formData.city}
                    onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                    required
                  />
                </div>
              </div>

              {/* WHEN Section */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  WHEN (Dispatch Date & Time)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Dispatch Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.dispatch_date}
                      onChange={e => setFormData(f => ({ ...f, dispatch_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Expected Return Date</label>
                    <input
                      type="date"
                      value={formData.expected_return_date}
                      onChange={e => setFormData(f => ({ ...f, expected_return_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Objective / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Field endurance test for motor controller under high temperature..."
                  value={formData.remarks}
                  onChange={e => setFormData(f => ({ ...f, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-xs font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Dispatching...' : 'Dispatch Part (Auto-Deduct Stock)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW DISPATCH SHEET MODAL
      ══════════════════════════════════════════════════ */}
      {showDetailModal && selectedDispatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative text-xs space-y-4">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="p-3 bg-indigo-100 rounded-xl"><FlaskConical className="h-6 w-6 text-indigo-600" /></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedDispatch.part_name}</h3>
                <p className="font-mono text-indigo-600 font-bold">{selectedDispatch.dispatch_tag}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Tester (WHO)</span>
                <p className="font-bold text-slate-900 text-sm">{selectedDispatch.tester_name}</p>
                <p className="text-slate-600">{selectedDispatch.tester_phone} · {selectedDispatch.tester_email}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">City / Location (WHERE)</span>
                <p className="font-bold text-red-600">{selectedDispatch.city}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Dispatch Timestamp (WHEN)</span>
                <p className="font-medium text-slate-800">{new Date(selectedDispatch.dispatch_date).toLocaleString()}</p>
                {selectedDispatch.expected_return_date && (
                  <p className="text-amber-700">Expected Return: {new Date(selectedDispatch.expected_return_date).toLocaleDateString()}</p>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Dispatched Quantity</span>
                <p className="font-bold text-indigo-600 text-sm">{selectedDispatch.quantity} units</p>
              </div>

              {selectedDispatch.remarks && (
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Remarks / Test Objectives</span>
                  <p className="italic text-slate-700 bg-white p-2 rounded border border-slate-200">"{selectedDispatch.remarks}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════════════════ */}
      {showDeleteModal && selectedDispatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative text-xs">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-xl"><Trash2 className="h-6 w-6 text-red-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete External Dispatch Record</h3>
                <p className="text-xs text-slate-400">{selectedDispatch.dispatch_tag}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete dispatch record for <span className="font-semibold text-slate-900">"{selectedDispatch.part_name}"</span> to {selectedDispatch.tester_name}?
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
                {actionLoading ? 'Deleting...' : 'Delete Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
