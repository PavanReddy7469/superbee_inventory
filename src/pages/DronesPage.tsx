import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMockDrones, getMockDroneTypes } from '../utils/mockData';
import { Search, PlusCircle, Edit, Trash2, X } from 'lucide-react';

interface Drone {
  id: string;
  drone_type_id: string;
  drone_number: string;
  uin_number: string;
  status: string;
  location: string;
}

const STATUS_COLORS: Record<string, string> = {
  ready_to_fly: 'bg-green-100 text-green-700',
  for_repair: 'bg-amber-100 text-amber-700',
  under_repair: 'bg-orange-100 text-orange-700',
  retired: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS: Record<string, string> = {
  ready_to_fly: 'Ready to Fly',
  for_repair: 'For Repair',
  under_repair: 'Under Repair',
  retired: 'Retired',
  active: 'Active',
  maintenance: 'Maintenance',
};

const DRONE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'ready_to_fly', label: 'Ready to Fly' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'for_repair', label: 'For Repair' },
  { value: 'under_repair', label: 'Under Repair' },
  { value: 'retired', label: 'Retired' },
];

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [droneTypes, setDroneTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [editForm, setEditForm] = useState({
    drone_number: '',
    uin_number: '',
    drone_type_id: '',
    location: '',
    status: '',
  });

  useEffect(() => { fetchDrones(); }, []);

  const fetchDrones = () => {
    setDrones(getMockDrones());
    setDroneTypes(getMockDroneTypes());
  };

  const getDroneTypeName = (typeId: string) => {
    const type = droneTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const handleEditClick = (drone: Drone) => {
    setEditingDrone(drone);
    setEditForm({
      drone_number: drone.drone_number,
      uin_number: drone.uin_number,
      drone_type_id: drone.drone_type_id,
      location: drone.location,
      status: drone.status,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDrone) return;
    if (!editForm.drone_number.trim()) return alert('Drone number is required');
    if (!editForm.uin_number.trim()) return alert('UIN number is required');

    const mockData = getMockDrones();
    const updated = mockData.map((d: any) =>
      d.id === editingDrone.id
        ? {
            ...d,
            drone_number: editForm.drone_number.trim(),
            uin_number: editForm.uin_number.trim(),
            drone_type_id: editForm.drone_type_id,
            location: editForm.location.trim(),
            status: editForm.status,
          }
        : d
    );
    localStorage.setItem('mockDrones', JSON.stringify(updated));
    setShowEditModal(false);
    setEditingDrone(null);
    fetchDrones();
  };

  const handleDeleteClick = (id: string) => {
    if (!confirm('Are you sure you want to delete this drone?')) return;
    const mockData = getMockDrones();
    const updated = mockData.filter((d: any) => d.id !== id);
    localStorage.setItem('mockDrones', JSON.stringify(updated));
    fetchDrones();
  };

  const filteredDrones = drones.filter(drone =>
    drone.drone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drone.uin_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drone.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard / Manage Drones</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Drones</h2>
          <Link to="/dashboard/drones/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            <PlusCircle className="h-4 w-4" /> Add Drone
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drones..."
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Drone Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">UIN Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Drone Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDrones.map((drone) => (
                <tr key={drone.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{drone.drone_number}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{drone.uin_number}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{getDroneTypeName(drone.drone_type_id)}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{drone.location}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[drone.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {STATUS_LABELS[drone.status] ?? (drone.status.charAt(0).toUpperCase() + drone.status.slice(1))}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(drone)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-xs font-medium"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(drone.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDrones.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No drones found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Drone Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Drone</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drone Number <span className="text-red-500">*</span></label>
                <input
                  value={editForm.drone_number}
                  onChange={e => setEditForm({ ...editForm, drone_number: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. SB-QUAD-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">UIN Number <span className="text-red-500">*</span></label>
                <input
                  value={editForm.uin_number}
                  onChange={e => setEditForm({ ...editForm, uin_number: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. UIN-1A2B3C4D5E6F"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drone Type</label>
                <select
                  value={editForm.drone_type_id}
                  onChange={e => setEditForm({ ...editForm, drone_type_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {droneTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  value={editForm.location}
                  onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. Warehouse A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {DRONE_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                  Save Changes
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
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
