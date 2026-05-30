import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMockDrones, getMockDroneTypes } from '../utils/mockData';
import { Search, PlusCircle } from 'lucide-react';

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

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [droneTypes, setDroneTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchDrones(); }, []);

  const fetchDrones = () => {
    setDrones(getMockDrones());
    setDroneTypes(getMockDroneTypes());
  };

  const getDroneTypeName = (typeId: string) => {
    const type = droneTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
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
    </div>
  );
}
