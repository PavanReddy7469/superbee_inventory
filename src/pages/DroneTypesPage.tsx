import { useEffect, useState } from 'react';
import { getMockDroneTypes } from '../utils/mockData';
import { Trash2, PlusCircle, X } from 'lucide-react';

// ── 4 Status options ──
type DroneStatus = 'ready_to_fly' | 'for_repair' | 'under_repair' | 'retired';

const STATUS_OPTIONS: { value: DroneStatus; label: string; color: string }[] = [
  { value: 'ready_to_fly', label: 'Ready to Fly', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'for_repair', label: 'For Repair', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'under_repair', label: 'Under Repair', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'retired', label: 'Retired', color: 'bg-red-100 text-red-700 border-red-300' },
];

const getStatusMeta = (val: string) =>
  STATUS_OPTIONS.find(s => s.value === val) ?? STATUS_OPTIONS[0];

interface DroneType {
  id: string;
  name: string;
  status: DroneStatus;
  created_at?: string;
}

export default function DroneTypesPage() {
  const [types, setTypes] = useState<DroneType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [newStatus, setNewStatus] = useState<DroneStatus>('ready_to_fly');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchTypes(); }, []);

  const fetchTypes = () => {
    setLoading(true);
    try {
      setTypes(getMockDroneTypes() as DroneType[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Update status inline via dropdown ──
  const handleStatusChange = (id: string, status: DroneStatus) => {
    const mockData = getMockDroneTypes();
    const updated = mockData.map((t: any) => t.id === id ? { ...t, status } : t);
    localStorage.setItem('mockDroneTypes', JSON.stringify(updated));
    fetchTypes();
  };

  const handleCreate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return alert('Name is required');
    const mockData = getMockDroneTypes();
    const newType = {
      id: 'dt' + Date.now(),
      name: name.trim(),
      description: '',
      manufacturer: 'SuperBee Custom',
      status: newStatus,
    };
    localStorage.setItem('mockDroneTypes', JSON.stringify([...mockData, newType]));
    setShowModal(false);
    setName('');
    setNewStatus('ready_to_fly');
    fetchTypes();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this drone type?')) return;
    const mockData = getMockDroneTypes();
    localStorage.setItem('mockDroneTypes', JSON.stringify(mockData.filter((t: any) => t.id !== id)));
    fetchTypes();
  };

  const filtered = types.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard / Manage Drone Types</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Drone Types</h2>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <PlusCircle className="h-4 w-4" /> Add Drone Type
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Drone Type Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-400">No drone types found</td></tr>
              ) : (
                filtered.map((t, idx) => {
                  const meta = getStatusMeta(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{t.name}</td>

                      {/* ── 4-option Status Dropdown (inline) ── */}
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select
                            value={t.status}
                            onChange={e => handleStatusChange(t.id, e.target.value as DroneStatus)}
                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors ${meta.color}`}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {/* chevron overlay */}
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-current opacity-60">▾</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Drone Type Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Drone Type</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drone Type Name <span className="text-red-500">*</span></label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Quadcopter X200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as DroneStatus)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                  Create
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
