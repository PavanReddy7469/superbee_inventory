import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI, categoriesAPI } from '../lib/api';
import { Upload, X, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';

// ── Static Vendors / Manufacturers ──
const VENDOR_OPTIONS = [
  'DJI Enterprise', 'Holybro', 'T-Motor', 'Sunnysky', 'Emax',
  'Hobbywing', 'Tattu', 'Gens Ace', 'Turnigy', 'Ublox',
  'FrSky', 'RunCam', 'GoPro', 'Matek Systems', 'ArduPilot',
  'Hobbyking', 'Gemfan', 'InvenSense', 'Bosch Sensortec', 'RMRC',
  'Other'
];

// ── Reusable "Select + Manual Other" component ──
function SelectOrOther({
  label, required, value, onChange, options, placeholder = '— Select —'
}: {
  label: string; required?: boolean; value: string;
  onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  const isOther = value === 'Other' || (value !== '' && !options.includes(value) && options.includes('Other'));
  const [manualVal, setManualVal] = useState(isOther ? value : '');

  // Sync manual box when parent resets
  useEffect(() => {
    if (value === '' || options.includes(value)) setManualVal('');
  }, [value]);

  const handleSelect = (v: string) => {
    if (v === 'Other') {
      onChange('Other');
      setManualVal('');
    } else {
      onChange(v);
    }
  };

  const handleManual = (v: string) => {
    setManualVal(v);
    onChange(v || 'Other'); // if blank, keep "Other" selected; emit actual string otherwise
  };

  const inputCls = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white';

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={isOther ? 'Other' : value}
        onChange={e => handleSelect(e.target.value)}
        className={inputCls}
        required={required && !isOther}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {isOther && (
        <input
          type="text"
          className={`${inputCls} mt-2`}
          placeholder={`Enter custom ${label.toLowerCase()}...`}
          value={manualVal}
          onChange={e => handleManual(e.target.value)}
          required={required}
          autoFocus
        />
      )}
    </div>
  );
}

export default function RegisterPartPage() {
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    partNameType: 'name' as 'name' | 'number',
    name: '',
    category_id: '',
    manufacturer: '',
    vendor: '',
    bill_number: '',
    quantity: 0,
    price: 0,
  });

  // Bill number validation
  const [billError, setBillError] = useState('');
  const [billOk, setBillOk] = useState(false);

  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedSKU, setGeneratedSKU] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // ── Bill number dropdown change ──
  const handleBillSelect = (val: string) => {
    setFormData(f => ({ ...f, bill_number: val }));
    validateBill(val);
  };

  const validateBill = (val: string) => {
    if (!val) { setBillError(''); setBillOk(false); return; }
    // Note: Bill validation against existing bills removed for now
    setBillError('');
    setBillOk(true);
  };


  const generateSKU = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sku = '';
    for (let i = 0; i < 12; i++) sku += chars.charAt(Math.floor(Math.random() * chars.length));
    return sku;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setInvoiceFile(e.target.files[0]);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) setInvoiceFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billError) return;
    setLoading(true);
    try {
      const sku = generateSKU();
      const newPart = {
        sku,
        name: formData.name,
        category_id: formData.category_id,
        manufacturer: formData.manufacturer,
        serial_number: formData.bill_number || '',
        quantity: formData.quantity,
        price: formData.price,
        status: 'active',
      };
      
      await inventoryAPI.create(newPart);
      
      setGeneratedSKU(sku);
      setShowSuccessModal(true);
      setFormData({ partNameType: 'name', name: '', category_id: '', manufacturer: '', vendor: '', bill_number: '', quantity: 0, price: 0 });
      setInvoiceFile(null);
      setBillError(''); 
      setBillOk(false);
    } catch (error: any) {
      console.error('Error registering part:', error);
      alert(error.response?.data?.error || 'Error registering part');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard / Register New Part</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Add New Inventory Part</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Part Name / Part Number ── */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-2">
                <label className={labelCls + ' mb-0'}>
                  Part Name / Part Number <span className="text-red-500">*</span>
                </label>
                <div className="flex bg-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <button type="button"
                    onClick={() => setFormData(f => ({ ...f, partNameType: 'name' }))}
                    className={`px-3 py-1 font-medium transition-colors ${formData.partNameType === 'name' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
                    Part Name
                  </button>
                  <button type="button"
                    onClick={() => setFormData(f => ({ ...f, partNameType: 'number' }))}
                    className={`px-3 py-1 font-medium transition-colors ${formData.partNameType === 'number' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
                    Part Number
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder={formData.partNameType === 'name' ? 'Enter part name...' : 'Enter part number...'}
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                className={inputCls}
                required
              />
            </div>

            {/* ── Category ── */}
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <select value={formData.category_id}
                onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))}
                className={inputCls} required>
                <option value="">— Select Category —</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            {/* ── Manufacturer (with "Other" manual entry) ── */}
            <SelectOrOther
              label="Manufacturer"
              required
              value={formData.manufacturer}
              onChange={v => setFormData(f => ({ ...f, manufacturer: v }))}
              options={VENDOR_OPTIONS}
              placeholder="— Select Manufacturer —"
            />

            {/* ── Vendor (with "Other" manual entry) ── */}
            <SelectOrOther
              label="Vendor"
              required
              value={formData.vendor}
              onChange={v => setFormData(f => ({ ...f, vendor: v }))}
              options={VENDOR_OPTIONS}
              placeholder="— Select Vendor —"
            />

            {/* ── Bill / Invoice Number — dropdown + manual ── */}
            <div>
              <label className={labelCls}>
                Bill / Invoice Number <span className="text-red-500">*</span>
              </label>

              {/* Manual text input for bill number */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. INV-2024-00123"
                  value={formData.bill_number}
                  onChange={e => handleBillSelect(e.target.value)}
                  className={`${inputCls} pr-9 ${billError ? 'border-red-400 focus:ring-red-400' : billOk ? 'border-green-400 focus:ring-green-400' : ''}`}
                />
                {billError && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                {billOk && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
              </div>

              {billError && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {billError}
                </p>
              )}
              {billOk && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Bill number is available
                </p>
              )}
            </div>

            {/* ── Quantity ── */}
            <div>
              <label className={labelCls}>Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={formData.quantity}
                onFocus={e => e.target.select()}
                onChange={e => setFormData(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                className={inputCls} required />
            </div>

            {/* ── Price ── */}
            <div>
              <label className={labelCls}>Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" value={formData.price}
                onFocus={e => e.target.select()}
                onChange={e => setFormData(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                className={inputCls} required />
            </div>
          </div>

          {/* ── Invoice Upload ── */}
          <div>
            <label className={labelCls}>Attach Invoice / Bill (PDF, Image)</label>
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm mb-1">
                {invoiceFile ? <span className="text-indigo-600 font-medium">{invoiceFile.name}</span> : 'Drag and drop a file here, or click to browse'}
              </p>
              <p className="text-xs text-slate-400">PDF, JPG, PNG accepted</p>
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              {invoiceFile && (
                <button type="button" onClick={e => { e.stopPropagation(); setInvoiceFile(null); }}
                  className="mt-2 inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm">
                  <X className="h-3.5 w-3.5" /> Remove file
                </button>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/dashboard/inventory')}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading || !!billError}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              {loading ? 'Registering...' : 'Register Part'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">Part Registered ✓</h3>
              <button onClick={() => { setShowSuccessModal(false); navigate('/dashboard/inventory'); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-green-100 rounded-full p-4">
                <QrCode className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-slate-600 text-sm text-center">Part registered with SKU:</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedSKU)}&color=1e293b&bgcolor=ffffff&margin=8`}
                alt="QR Code"
                className="w-[180px] h-[180px] rounded-lg border border-slate-200"
              />
              <p className="text-base font-mono font-bold text-slate-900 bg-slate-100 px-4 py-1 rounded-lg">{generatedSKU}</p>
              <button onClick={() => window.print()} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                Download / Print SKU
              </button>
              <button onClick={() => { setShowSuccessModal(false); navigate('/dashboard/inventory'); }}
                className="w-full border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                Go to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
