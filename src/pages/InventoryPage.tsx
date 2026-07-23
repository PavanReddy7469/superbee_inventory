import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../lib/api';
import {
  Plus, Search, QrCode, Edit, Trash2, Download, X,
  FileText, Eye, ArrowUpDown, PackageCheck, PackageX, Save, AlertTriangle
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Type definitions

interface InventoryPart {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  manufacturer: string;
  vendor?: string;
  serial_number?: string;
  quantity: number;
  price: number;
  status: 'active' | 'inactive';
  invoice_url?: string;
  created_at: string;
  updated_at?: string;
  category?: { name: string };
  category_name?: string;
}

// ── Edit form shape ──
interface EditForm {
  name: string;
  category_id: string;
  manufacturer: string;
  serial_number: string;
  quantity: number;
  price: number;
  status: string;
}

export default function InventoryPage() {
  const [parts, setParts] = useState<InventoryPart[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<{ sku: string; name: string } | null>(null);
  const [qrLoaded, setQrLoaded] = useState(false);

  // Invoice
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoicePart, setInvoicePart] = useState<InventoryPart | null>(null);

  // Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPart, setEditingPart] = useState<InventoryPart | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', category_id: '', manufacturer: '', serial_number: '', quantity: 0, price: 0, status: 'active' });
  const [editSaving, setEditSaving] = useState(false);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPart, setDeletingPart] = useState<InventoryPart | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sort & cart
  const [sortByStock, setSortByStock] = useState<'none' | 'asc' | 'desc'>('none');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { addItem } = useCart();
  const { profile } = useAuth();

  useEffect(() => { fetchParts(); }, []);

  const fetchParts = async () => {
    try {
      const partsResponse = await inventoryAPI.getAll();
      // FIX-17: Backend returns paginated response { data: [...], total, page, limit, totalPages }
      const partsData = partsResponse.data.data || partsResponse.data;

      // Map category names to parts and ensure numeric fields are numbers
      const partsWithCategories = (Array.isArray(partsData) ? partsData : []).map((part: any) => ({
        ...part,
        price: Number(part.price) || 0,
        quantity: Number(part.quantity) || 0,
        category: { name: part.category_name || 'Unknown' }
      }));

      setParts(partsWithCategories);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to load inventory. Please try again.');
    }
  };

  // ── QR helpers ──
  const showQRCode = (sku: string, name: string) => { setSelectedPart({ sku, name }); setQrLoaded(false); setShowQRModal(true); };
  const getQRUrl = (sku: string) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(sku)}&color=1e293b&bgcolor=ffffff&margin=10`;
  const handleDownloadQR = () => {
    if (!selectedPart) return;
    const a = document.createElement('a'); a.href = getQRUrl(selectedPart.sku); a.download = `QR_${selectedPart.sku}.png`; a.click();
  };

  // ── Edit handlers ──
  const openEdit = (part: InventoryPart) => {
    setEditingPart(part);
    setEditForm({ name: part.name, category_id: part.category_id, manufacturer: part.manufacturer, serial_number: part.serial_number || '', quantity: part.quantity, price: part.price, status: part.status });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingPart) return;
    setEditSaving(true);
    
    try {
      await inventoryAPI.update(editingPart.id, editForm);
      await fetchParts(); // Refresh data
      setShowEditModal(false);
      setEditingPart(null);
    } catch (error) {
      console.error('Error updating part:', error);
      alert('Failed to update part. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete handlers ──
  const openDelete = (part: InventoryPart) => { setDeletingPart(part); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (!deletingPart) return;
    setDeleteLoading(true);
    
    try {
      await inventoryAPI.delete(deletingPart.id);
      await fetchParts(); // Refresh data
      setShowDeleteConfirm(false);
      setDeletingPart(null);
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Failed to delete part. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Invoice helpers ──
  const getInvoiceFileData = (part: InventoryPart): { dataUrl: string; name: string; type: string } | null => {
    if (part.invoice_url) {
      const url = part.invoice_url;
      const isImage = url.startsWith('data:image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
      return {
        dataUrl: url,
        name: `Invoice_${part.sku}.${isImage ? 'png' : 'pdf'}`,
        type: isImage ? 'image/png' : 'application/pdf'
      };
    }
    try {
      const raw = localStorage.getItem(`invoice_file_${part.sku}`) || localStorage.getItem(`invoice_file_${part.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') {
          return { dataUrl: parsed, name: `Invoice_${part.sku}.pdf`, type: 'application/pdf' };
        }
        return parsed;
      }
    } catch (e) {}
    return null;
  };

  const openInvoice = (part: InventoryPart) => { setInvoicePart(part); setShowInvoiceModal(true); };

  const generateInvoiceText = (part: InventoryPart) => {
    const now = new Date();
    return `========================================\n        SUPERBEE AERONAUTICS\n        INVENTORY INVOICE\n========================================\nDate       : ${now.toLocaleDateString()}\nTime       : ${now.toLocaleTimeString()}\nInvoice No : INV-${part.sku}-${now.getFullYear()}\n----------------------------------------\nPart Name  : ${part.name}\nSKU        : ${part.sku}\nCategory   : ${(part as any).category?.name || 'N/A'}\nManufacturer: ${part.manufacturer}\nSerial No  : ${part.serial_number || 'N/A'}\nQuantity   : ${part.quantity} units\nUnit Price : ₹${part.price.toFixed(2)}\n----------------------------------------\nTOTAL      : ₹${(part.price * part.quantity).toFixed(2)}\n========================================\nStatus     : ${part.quantity > 0 ? 'Stock Available' : 'Out of Stock'}\n========================================\nThank you for using Superbee Aeronautics\nInventory Management Portal`;
  };

  const downloadInvoice = (part: InventoryPart) => {
    const uploaded = getInvoiceFileData(part);
    if (uploaded && uploaded.dataUrl) {
      const a = document.createElement('a');
      a.href = uploaded.dataUrl;
      a.download = uploaded.name || `Invoice_${part.sku}.pdf`;
      a.click();
      return;
    }
    const blob = new Blob([generateInvoiceText(part)], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Invoice_${part.sku}.txt`; a.click();
  };

  // ── Live stock counts ──
  const stockAvailableCount = useMemo(() => parts.filter(p => p.quantity > 0).length, [parts]);
  const outOfStockCount = useMemo(() => parts.filter(p => p.quantity === 0).length, [parts]);

  // ── Filtered + sorted ──
  const filteredParts = useMemo(() => {
    let list = parts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortByStock === 'desc') list = [...list].sort((a, b) => b.quantity - a.quantity);
    else if (sortByStock === 'asc') list = [...list].sort((a, b) => a.quantity - b.quantity);
    return list;
  }, [parts, searchTerm, sortByStock]);

  const cycleSortByStock = () => setSortByStock(prev => prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none');
  const sortLabel = sortByStock === 'desc' ? 'High → Low' : sortByStock === 'asc' ? 'Low → High' : 'Sort by Stock';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard / Manage Inventory</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Inventory</h2>
          {profile?.role?.name !== 'technician' && (
            <Link to="/dashboard/inventory/register" className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-5 w-5" /><span>Register New Parts</span>
            </Link>
          )}
        </div>

        {/* ── Stock Summary Bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <PackageCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">① Stock Available</span>
            <span className="ml-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stockAvailableCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <PackageX className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">② Out of Stock</span>
            <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{outOfStockCount}</span>
          </div>
          <button onClick={cycleSortByStock} className={`flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium transition-colors ${sortByStock !== 'none' ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            <ArrowUpDown className="h-4 w-4" />{sortLabel}
          </button>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-56 pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                {profile?.role?.name !== 'technician' && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">SKU / QR</th>}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                {profile?.role?.name !== 'technician' && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Manufacturer</th>}
                {profile?.role?.name !== 'technician' && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Serial No.</th>}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Quantity</th>
                {profile?.role?.name !== 'technician' && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Price</th>}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock</th>
                {profile?.role?.name !== 'technician' && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Invoice</th>}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredParts.map(part => (
                <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                  {profile?.role?.name !== 'technician' && (
                    <td className="px-4 py-3">
                      <button onClick={() => showQRCode(part.sku, part.name)} className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 group" title="View QR Code">
                        <QrCode className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-mono">{part.sku}</span>
                      </button>
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-slate-900">{part.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{(part as any).category?.name}</td>
                  {profile?.role?.name !== 'technician' && <td className="px-4 py-3 text-sm text-slate-900">{part.manufacturer}</td>}
                  {profile?.role?.name !== 'technician' && <td className="px-4 py-3 text-sm text-slate-900">{part.serial_number || '-'}</td>}
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{part.quantity}</td>
                  {profile?.role?.name !== 'technician' && <td className="px-4 py-3 text-sm text-slate-900">₹{part.price.toFixed(2)}</td>}

                  {/* Stock badge — auto updates */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${part.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {part.quantity > 0 ? <><PackageCheck className="h-3 w-3" />Stock Available</> : <><PackageX className="h-3 w-3" />Out of Stock</>}
                    </span>
                  </td>

                  {/* Invoice */}
                  {profile?.role?.name !== 'technician' && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openInvoice(part)} title="View Invoice" className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium">
                          <Eye className="h-3.5 w-3.5" />View
                        </button>
                        <button onClick={() => downloadInvoice(part)} title="Download Invoice" className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium">
                          <Download className="h-3.5 w-3.5" />Download
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Action */}
                  <td className="px-4 py-3">
                    {profile?.role?.name === 'technician' ? (
                      <div className="flex items-center space-x-2">
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={quantities[part.id] || ''} onChange={e => setQuantities({ ...quantities, [part.id]: Number(e.target.value.replace(/[^0-9]/g, '')) })} className="w-20 px-2 py-1 border rounded text-sm" placeholder="Qty" />
                        <button onClick={() => {
                          const q = quantities[part.id] || 0;
                          if (!q || q <= 0) return alert('Enter a valid quantity');
                          if (q > part.quantity) return alert('Quantity exceeds stock');
                          addItem(part, q);
                          setQuantities(prev => ({ ...prev, [part.id]: 0 }));
                          alert('Added to cart');
                        }} className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm">
                          Add to Cart
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {/* ── WORKING EDIT BUTTON ── */}
                        <button
                          onClick={() => openEdit(part)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors"
                          title="Edit Part"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {/* ── WORKING DELETE BUTTON ── */}
                        <button
                          onClick={() => openDelete(part)}
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Delete Part"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredParts.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-500">No inventory items found</p></div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 text-sm text-slate-600">
          <div>Showing {filteredParts.length} of {parts.length} entries</div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded">1</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════
          EDIT MODAL
      ══════════════════════════ */}
      {showEditModal && editingPart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>

            <div className="flex items-center gap-3 mb-5">
              <div className="bg-yellow-100 p-2.5 rounded-xl"><Edit className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Part</h3>
                <p className="text-xs text-slate-400 font-mono">{editingPart.sku}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Part Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Manufacturer</label>
                <input type="text" value={editForm.manufacturer} onChange={e => setEditForm(f => ({ ...f, manufacturer: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Serial Number</label>
                <input type="text" value={editForm.serial_number} onChange={e => setEditForm(f => ({ ...f, serial_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={editForm.quantity} onFocus={e => e.target.select()} onChange={e => setEditForm(f => ({ ...f, quantity: Number(e.target.value.replace(/[^0-9]/g, '')) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹)</label>
                <input type="text" inputMode="decimal" value={editForm.price} onFocus={e => e.target.select()} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value.replace(/[^0-9.]/g, '')) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={saveEdit} disabled={editSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white px-4 py-2.5 rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm disabled:opacity-60">
                {editSaving ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <Save className="h-4 w-4" />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════ */}
      {showDeleteConfirm && deletingPart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowDeleteConfirm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="bg-red-100 p-4 rounded-full mb-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Part?</h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to delete<br />
                <span className="font-semibold text-slate-700">"{deletingPart.name}"</span>?<br />
                <span className="text-xs text-red-500 mt-1 block">This action cannot be undone.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={confirmDelete} disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-60">
                {deleteLoading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <Trash2 className="h-4 w-4" />}
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════
          QR CODE MODAL
      ══════════════════════════ */}
      {showQRModal && selectedPart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg"><QrCode className="h-5 w-5 text-indigo-600" /></div>
              <div><h3 className="text-lg font-bold text-slate-900">QR Code</h3><p className="text-xs text-slate-500 truncate max-w-[220px]">{selectedPart.name}</p></div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-inner">
                {!qrLoaded && <div className="absolute inset-0 flex items-center justify-center rounded-xl"><svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg></div>}
                <img src={getQRUrl(selectedPart.sku)} alt={`QR for ${selectedPart.sku}`} className={`w-[220px] h-[220px] rounded-lg transition-opacity duration-300 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setQrLoaded(true)} />
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">SKU</p>
                <p className="text-base font-mono font-bold text-slate-800 bg-slate-100 px-4 py-1 rounded-lg tracking-wide">{selectedPart.sku}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={handleDownloadQR} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"><Download className="h-4 w-4" />Download</button>
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">🖨︎ Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════
          INVOICE MODAL
      ══════════════════════════ */}
      {showInvoiceModal && invoicePart && (() => {
        const uploaded = getInvoiceFileData(invoicePart);
        const isPdf = uploaded?.dataUrl?.startsWith('data:application/pdf') || uploaded?.type?.includes('pdf') || uploaded?.name?.endsWith('.pdf');
        const isImg = uploaded?.dataUrl?.startsWith('data:image/') || uploaded?.type?.includes('image') || /\.(png|jpg|jpeg|gif|webp)$/i.test(uploaded?.name || '');

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-2xl ${uploaded ? 'max-w-4xl w-full h-[85vh]' : 'max-w-md w-full'} p-6 relative flex flex-col`}>
              <button onClick={() => setShowInvoiceModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 z-10">
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2.5 rounded-xl"><FileText className="h-6 w-6 text-blue-600" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {uploaded ? 'Uploaded Invoice / Bill Document' : 'Inventory Invoice'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {uploaded ? (uploaded.name || `Invoice_${invoicePart.sku}`) : `INV-${invoicePart.sku}-${new Date().getFullYear()}`}
                  </p>
                </div>
              </div>

              {uploaded ? (
                <div className="flex-1 overflow-hidden flex flex-col mb-4 min-h-0">
                  {isPdf ? (
                    <iframe
                      src={uploaded.dataUrl}
                      title={`Invoice_${invoicePart.sku}`}
                      className="w-full h-full rounded-xl border border-slate-200 bg-slate-100 min-h-[450px]"
                    />
                  ) : isImg ? (
                    <div className="w-full h-full overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-2 flex items-center justify-center">
                      <img src={uploaded.dataUrl} alt="Uploaded Invoice" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                    </div>
                  ) : (
                    <iframe
                      src={uploaded.dataUrl}
                      title={`Invoice_${invoicePart.sku}`}
                      className="w-full h-full rounded-xl border border-slate-200 bg-slate-100 min-h-[450px]"
                    />
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 mb-5 text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500">Date</span><span className="font-medium text-slate-800">{new Date().toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Part Name</span><span className="font-medium text-slate-800 text-right max-w-[200px]">{invoicePart.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">SKU</span><span className="font-mono font-medium text-slate-800">{invoicePart.sku}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-medium text-slate-800">{(invoicePart as any).category?.name || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Manufacturer</span><span className="font-medium text-slate-800">{invoicePart.manufacturer}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Serial Number</span><span className="font-medium text-slate-800">{invoicePart.serial_number || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="font-medium text-slate-800">{invoicePart.quantity} units</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Unit Price</span><span className="font-medium text-slate-800">₹{invoicePart.price.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-slate-300 pt-3"><span className="font-semibold text-slate-700">Total Value</span><span className="font-bold text-indigo-700 text-base">₹{(invoicePart.price * invoicePart.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Stock Status</span><span className={`font-semibold ${invoicePart.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>{invoicePart.quantity > 0 ? '✓ Stock Available' : '✗ Out of Stock'}</span></div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => downloadInvoice(invoicePart)} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                  <Download className="h-4 w-4" />Download {uploaded ? 'Uploaded File' : 'Invoice'}
                </button>
                {uploaded && (
                  <button onClick={() => window.open(uploaded.dataUrl, '_blank')} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    <Eye className="h-4 w-4" />Open in New Tab
                  </button>
                )}
                <button onClick={() => window.print()} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                  🖨︎ Print
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
