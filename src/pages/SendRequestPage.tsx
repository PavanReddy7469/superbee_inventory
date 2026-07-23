import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesAPI, sendRequestsAPI } from '../lib/api';
import { Send, CheckCircle2, ExternalLink, Hash, Tag, ShoppingBag, Calendar } from 'lucide-react';

type NameMode = 'name' | 'number';

export default function SendRequestPage() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [categories, setCategories] = useState<any[]>([]);
    const [mode, setMode] = useState<NameMode>('name');
    const [form, setForm] = useState({
        part_value: '',
        category_id: '',
        website: '',
        quantity: 1,
        date: '',
        time: '',
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    // Pre-fill date & time with current and fetch categories
    useEffect(() => {
        categoriesAPI.getAll()
            .then(res => setCategories(res.data || []))
            .catch(() => {});

        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        setForm(f => ({
            ...f,
            date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
            time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
        }));
    }, []);

    const inputCls = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white';
    const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.part_value.trim()) return alert('Part name/number is required');
        if (!form.website.trim()) return alert('Website / Purchase link is required');
        setSaving(true);

        try {
            const catObj = categories.find(c => String(c.id) === String(form.category_id));
            const catName = catObj ? catObj.name : (form.category_id || null);

            await sendRequestsAPI.create({
                part_value: form.part_value.trim(),
                part_mode: mode,
                category_name: catName,
                website: form.website.trim(),
                quantity: form.quantity,
                requested_by: profile?.name || profile?.email || 'AE User',
                email: profile?.email || '',
                requested_at: `${form.date}T${form.time}:00`,
            });

            setSaving(false);
            setShowSuccess(true);
        } catch (error: any) {
            console.error('Error submitting send request:', error);
            alert(error.response?.data?.error || 'Failed to submit request');
            setSaving(false);
        }
    };

    const resetForm = () => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        setForm({
            part_value: '',
            category_id: '',
            website: '',
            quantity: 1,
            date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
            time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
        });
        setMode('name');
        setShowSuccess(false);
    };

    const catName = categories.find(c => c.id === form.category_id)?.name || '';

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Send Request</h1>
                <p className="text-slate-500 text-sm mt-1">Request a part from an external source / website</p>
            </div>

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

                    {/* Header icon */}
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                        <div className="bg-indigo-100 p-3 rounded-xl">
                            <Send className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">New Purchase Request</h2>
                            <p className="text-xs text-slate-400">Fill in the details — admin will review and procure</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Part Name / Part Number toggle */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <button type="button" onClick={() => setMode('name')}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${mode === 'name' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    Part Name
                                </button>
                                <button type="button" onClick={() => setMode('number')}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${mode === 'number' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    Part Number
                                </button>
                            </div>
                            <div className="relative">
                                {mode === 'number'
                                    ? <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    : <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />}
                                <input
                                    type="text"
                                    placeholder={mode === 'name' ? 'e.g. Pixhawk 4 Flight Controller' : 'e.g. FC-PIXHAWK4'}
                                    value={form.part_value}
                                    onChange={e => setForm(f => ({ ...f, part_value: e.target.value }))}
                                    className={`${inputCls} pl-10`}
                                    required
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className={labelCls}>Category</label>
                            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>
                                <option value="">— Select category (optional) —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Website / Purchase Link */}
                        <div>
                            <label className={labelCls}>Website / Purchase Link <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="e.g. amazon.in/item/B08... or Robocraze"
                                    value={form.website}
                                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                                    className={`${inputCls} pl-10`}
                                    required
                                />
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className={labelCls}>Quantity <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={form.quantity}
                                    onFocus={e => e.target.select()}
                                    onChange={e => setForm(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 1) }))}
                                    className={`${inputCls} pl-10`}
                                    required
                                />
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}><Calendar className="inline h-3.5 w-3.5 mr-1 text-slate-400" />Date <span className="text-red-500">*</span></label>
                                <input type="date" value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className={inputCls} required />
                            </div>
                            <div>
                                <label className={labelCls}><Calendar className="inline h-3.5 w-3.5 mr-1 text-slate-400" />Time <span className="text-red-500">*</span></label>
                                <input type="time" value={form.time}
                                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                                    className={inputCls} required />
                            </div>
                        </div>

                        {/* Preview card */}
                        {form.part_value && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Request Summary</p>
                                <div className="flex justify-between"><span className="text-slate-500">{mode === 'name' ? 'Part Name' : 'Part Number'}</span><span className="font-medium text-slate-800">{form.part_value}</span></div>
                                {catName && <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-medium text-slate-800">{catName}</span></div>}
                                <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="font-medium text-slate-800">{form.quantity}</span></div>
                                {form.website && <div className="flex justify-between gap-2"><span className="text-slate-500 flex-shrink-0">Source</span><span className="font-medium text-slate-800 truncate text-right">{form.website}</span></div>}
                                {form.date && <div className="flex justify-between"><span className="text-slate-500">Date & Time</span><span className="font-medium text-slate-800">{form.date} {form.time}</span></div>}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <button type="button" onClick={() => navigate(-1)}
                                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 text-sm font-medium transition-colors">
                                {saving
                                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending...</>
                                    : <><Send className="h-4 w-4" /> Send Request</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Request Sent!</h3>
                        <p className="text-slate-500 text-sm mb-1">
                            <span className="font-medium text-slate-700">{form.part_value}</span> (Qty: {form.quantity})
                        </p>
                        {form.website && <p className="text-xs text-slate-400 mb-4">Source: {form.website}</p>}
                        <div className="flex flex-col gap-2">
                            <button onClick={resetForm}
                                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                Send Another Request
                            </button>
                            <button onClick={() => navigate('/dashboard')}
                                className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
