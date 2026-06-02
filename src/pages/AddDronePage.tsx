import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMockDroneTypes, getMockDrones } from '../utils/mockData';
import { ArrowRight, CheckCircle2, X, Plane } from 'lucide-react';

type DroneStatus = 'ready_to_fly' | 'for_repair' | 'under_repair' | 'retired';

const STATUS_OPTIONS: { value: DroneStatus; label: string; color: string }[] = [
    { value: 'ready_to_fly', label: 'Ready to Fly', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'for_repair', label: 'For Repair', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: 'under_repair', label: 'Under Repair', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'retired', label: 'Retired', color: 'bg-red-100 text-red-700 border-red-300' },
];

export default function AddDronePage() {
    const navigate = useNavigate();

    // Step 1: drone type selection
    const [droneTypes, setDroneTypes] = useState<any[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState('');
    const [customTypeName, setCustomTypeName] = useState('');
    const [step, setStep] = useState<1 | 2>(1);

    // Step 2: detail form
    const [form, setForm] = useState({
        drone_number: '',
        uin_number: '',
        location: '',
        status: 'ready_to_fly' as DroneStatus,
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setDroneTypes(getMockDroneTypes());
    }, []);

    const isOtherType = selectedTypeId === '__other__';
    const selectedType = isOtherType
        ? { id: '__other__', name: customTypeName || 'Other' }
        : droneTypes.find(t => t.id === selectedTypeId);

    const handleNext = () => {
        if (!selectedTypeId) return alert('Please select a drone type first');
        if (isOtherType && !customTypeName.trim()) return alert('Please enter a custom drone type name');
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.drone_number.trim()) return alert('Drone number is required');
        if (!form.uin_number.trim()) return alert('UIN number is required');
        setSaving(true);
        await new Promise(r => setTimeout(r, 400));

        let finalTypeId = selectedTypeId;
        if (selectedTypeId === '__other__') {
            const newTypeId = 'dt_' + Date.now();
            const existingTypes = getMockDroneTypes();
            const newType = {
                id: newTypeId,
                name: customTypeName.trim(),
                description: 'Custom drone type added during drone registration',
                manufacturer: 'SuperBee Custom',
                status: 'ready_to_fly' as const
            };
            localStorage.setItem('mockDroneTypes', JSON.stringify([...existingTypes, newType]));
            finalTypeId = newTypeId;
        }

        const existing = getMockDrones();
        const newDrone = {
            id: 'drone_' + Date.now(),
            drone_type_id: finalTypeId,
            drone_number: form.drone_number.trim(),
            uin_number: form.uin_number.trim(),
            location: form.location.trim(),
            status: form.status,
        };
        localStorage.setItem('mockDrones', JSON.stringify([...existing, newDrone]));
        setSaving(false);
        setShowSuccess(true);
    };

    const inputCls = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white';
    const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard / Manage Drone / Add Drone</h1>
            </div>

            {/* ── Step Indicator ── */}
            <div className="flex items-center gap-3 mb-6">
                {[{ n: 1, label: 'Select Drone Type' }, { n: 2, label: 'Enter Details' }].map(({ n, label }, i) => (
                    <div key={n} className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-colors ${step > n ? 'bg-indigo-600 border-indigo-600 text-white' :
                            step === n ? 'border-indigo-600 text-indigo-600 bg-white' :
                                'border-slate-300 text-slate-400 bg-white'
                            }`}>
                            {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
                        </div>
                        <span className={`text-sm font-medium ${step >= n ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                        {i === 0 && <ArrowRight className="h-4 w-4 text-slate-300 ml-1" />}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">

                {/* ════════ STEP 1 — Select Drone Type ════════ */}
                {step === 1 && (
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-indigo-100 p-2.5 rounded-xl"><Plane className="h-5 w-5 text-indigo-600" /></div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Select Drone Type</h2>
                                <p className="text-xs text-slate-400">Choose the type of drone you want to add</p>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className={labelCls}>Drone Type <span className="text-red-500">*</span></label>
                            <select
                                value={selectedTypeId}
                                onChange={e => { setSelectedTypeId(e.target.value); setCustomTypeName(''); }}
                                className={`${inputCls} ${!selectedTypeId ? 'text-slate-400' : 'text-slate-900'}`}
                            >
                                <option value="">— Select a Drone Type —</option>
                                {droneTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                                <option value="__other__">Other</option>
                            </select>
                            {isOtherType && (
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Enter custom drone type name..."
                                    value={customTypeName}
                                    onChange={e => setCustomTypeName(e.target.value)}
                                    className={`${inputCls} mt-2`}
                                    required
                                />
                            )}
                            {droneTypes.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">No drone types found. Please add drone types first under Manage Drone Type.</p>
                            )}
                        </div>

                        {/* Preview card when type selected */}
                        {selectedType && (
                            <div className="mb-5 flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                                <div className="bg-indigo-100 p-2 rounded-lg"><Plane className="h-5 w-5 text-indigo-600" /></div>
                                <div>
                                    <p className="text-sm font-semibold text-indigo-900">{selectedType.name}</p>
                                    <p className="text-xs text-indigo-500 mt-0.5">Proceed to enter drone details →</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate('/dashboard/drones')}
                                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button type="button" onClick={handleNext} disabled={!selectedTypeId}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">
                                Next <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ════════ STEP 2 — Enter Details ════════ */}
                {step === 2 && (
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-indigo-100 p-2.5 rounded-xl"><Plane className="h-5 w-5 text-indigo-600" /></div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Add Drone Details</h2>
                                <p className="text-xs text-slate-400">Type: <span className="font-semibold text-indigo-600">{selectedType?.name}</span></p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Drone Number */}
                                <div>
                                    <label className={labelCls}>Drone Number <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="e.g. SBA-D-001"
                                        value={form.drone_number}
                                        onChange={e => setForm(f => ({ ...f, drone_number: e.target.value }))}
                                        className={inputCls} required />
                                </div>

                                {/* UIN Number */}
                                <div>
                                    <label className={labelCls}>UIN Number <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="e.g. UA-IND-XXXX-XXXX"
                                        value={form.uin_number}
                                        onChange={e => setForm(f => ({ ...f, uin_number: e.target.value }))}
                                        className={inputCls} required />
                                </div>

                                {/* Drone Type — read-only display */}
                                <div>
                                    <label className={labelCls}>Drone Type</label>
                                    <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                                        {selectedType?.name}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className={labelCls}>Location <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="e.g. Hangar A, Chennai"
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                        className={inputCls} required />
                                </div>

                                {/* Status dropdown — 4 options */}
                                <div className="sm:col-span-2">
                                    <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                                    <select value={form.status}
                                        onChange={e => setForm(f => ({ ...f, status: e.target.value as DroneStatus }))}
                                        className={inputCls} required>
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    {/* Colored badge preview */}
                                    {form.status && (() => {
                                        const meta = STATUS_OPTIONS.find(s => s.value === form.status)!;
                                        return (
                                            <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                                                {meta.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(1)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                                    ← Back
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 text-sm font-medium transition-colors">
                                    {saving
                                        ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving...</>
                                        : 'Add Drone'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* ── Success Modal ── */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <button onClick={() => { setShowSuccess(false); navigate('/dashboard/drones'); }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hidden"><X className="h-5 w-5" /></button>
                        <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Drone Added!</h3>
                        <p className="text-slate-500 text-sm mb-1"><span className="font-medium text-slate-700">{form.drone_number}</span> has been registered.</p>
                        <p className="text-slate-400 text-xs mb-5">Type: {selectedType?.name}</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => { setShowSuccess(false); setStep(1); setSelectedTypeId(''); setForm({ drone_number: '', uin_number: '', location: '', status: 'ready_to_fly' }); }}
                                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                Add Another Drone
                            </button>
                            <button onClick={() => navigate('/dashboard/drones')}
                                className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
                                View All Drones
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
