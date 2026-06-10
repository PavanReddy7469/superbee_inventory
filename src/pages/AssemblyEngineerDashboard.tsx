import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aeRequestsAPI, inventoryAPI } from '../lib/api';
import {
    Package,
    ShoppingCart,
    CheckCircle,
    XCircle,
    Clock,
    PlusCircle,
    ArrowRight,
    Layers,
    AlertTriangle,
    Trash2,
} from 'lucide-react';

interface AeRequest {
    id: string;
    drone_number: string;
    uin_number: string;
    items: Array<{ part_id: string; quantity: number; part_name?: string }>;
    status: string;
    created_at: string;
    updated_at?: string;
    requested_by?: string;
    email?: string;
}

export default function AssemblyEngineerDashboard() {
    const { profile } = useAuth();

    // Data
    const [requests, setRequests] = useState<AeRequest[]>([]);
    const [inventoryCount, setInventoryCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [droneCount, setDroneCount] = useState(0);

    // Live clock
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const loadData = async () => {
        try {
            // Fetch AE requests from API
            const reqsResponse = await aeRequestsAPI.getAll();
            // FIX-17: Backend returns paginated response { data: [...], total, page, limit, totalPages }
            const allRequests: AeRequest[] = reqsResponse.data.data || reqsResponse.data;
            
            // Filter to show only current user's requests
            const myReqs = allRequests.filter(r => 
                r.email === profile?.email || r.requested_by === profile?.name
            );
            setRequests(myReqs);

            // Fetch inventory parts
            const partsResponse = await inventoryAPI.getAll();
            // FIX-17: Backend returns paginated response { data: [...], total, page, limit, totalPages }
            const parts = partsResponse.data.data || partsResponse.data;
            setInventoryCount(Array.isArray(parts) ? parts.length : 0);
            setLowStockCount(Array.isArray(parts) ? parts.filter((p: any) => Number(p.quantity) <= 5).length : 0);

            // Fetch dashboard stats for drone count
            try {
              const dronesData = JSON.parse(localStorage.getItem('mockDrones') || '[]');
              setDroneCount(dronesData.filter((d: any) => d.status === 'active' || d.status === 'ready_to_fly').length);
            } catch {
              setDroneCount(0);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    useEffect(() => { loadData(); }, [profile]);

    const withdrawRequest = async (id: string) => {
        if (!confirm('Withdraw this request? This cannot be undone.')) return;
        try {
            await aeRequestsAPI.withdraw(id);
            loadData(); // Reload data after withdrawal
        } catch (error) {
            console.error('Error withdrawing request:', error);
            alert('Failed to withdraw request');
        }
    };

    const myRequests = requests; // In real app, filter by current user
    const pending = myRequests.filter(r => r.status === 'pending').length;
    const approved = myRequests.filter(r => r.status === 'approved').length;
    const rejected = myRequests.filter(r => r.status === 'rejected').length;
    const recent = [...myRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    // Format clock
    const pad = (n: number) => String(n).padStart(2, '0');
    const h = now.getHours(), ampm = h >= 12 ? 'PM' : 'AM';
    const clockTime = `${pad(h % 12 || 12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const clockDate = `${DAYS[now.getDay()]}, ${pad(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

    const statusMeta = (s: string) =>
        s === 'approved' ? { color: 'bg-green-100 text-green-700', Icon: CheckCircle } :
            s === 'rejected' ? { color: 'bg-red-100 text-red-700', Icon: XCircle } :
                s === 'withdrawn' ? { color: 'bg-slate-100 text-slate-500', Icon: XCircle } :
                    { color: 'bg-amber-100 text-amber-700', Icon: Clock };

    return (
        <div className="space-y-6">

            {/* ── Welcome + Live Clock ── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
                {/* decorative circles */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white opacity-5 rounded-full" />
                <div className="absolute bottom-0 left-1/2 w-56 h-56 bg-white opacity-5 rounded-full -translate-x-1/2 translate-y-1/2" />

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back 👋</p>
                        <h1 className="text-2xl sm:text-3xl font-bold">{profile?.name || 'Assembly Engineer'}</h1>
                        <p className="text-indigo-200 text-sm mt-1 capitalize">{profile?.role?.name} · SuperBee Aeronautics</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-right border border-white/20">
                        <p className="text-indigo-200 text-xs font-medium">{clockDate}</p>
                        <p className="text-2xl font-bold font-mono tracking-widest mt-0.5">{clockTime}</p>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'My Requests', value: myRequests.length, icon: Layers, gradient: 'from-blue-500 to-blue-600', sub: 'total raised' },
                    { label: 'Pending', value: pending, icon: Clock, gradient: 'from-amber-500 to-amber-600', sub: 'awaiting approval' },
                    { label: 'Approved', value: approved, icon: CheckCircle, gradient: 'from-green-500 to-green-600', sub: 'parts received' },
                    { label: 'Rejected', value: rejected, icon: XCircle, gradient: 'from-red-500 to-red-600', sub: 'not approved' },
                ].map(({ label, value, icon: Icon, gradient, sub }) => (
                    <div key={label} className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-md`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">{label}</p>
                            <Icon className="h-5 w-5 text-white/60" />
                        </div>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="text-white/60 text-xs mt-1">{sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Quick Actions ── */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link to="/dashboard/cart"
                            className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 group-hover:bg-indigo-200 p-2 rounded-lg transition-colors">
                                    <ShoppingCart className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Raise Part Request</p>
                                    <p className="text-xs text-slate-500">Request parts from inventory</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to="/dashboard/inventory"
                            className="flex items-center justify-between p-3 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="bg-cyan-100 group-hover:bg-cyan-200 p-2 rounded-lg transition-colors">
                                    <Package className="h-4 w-4 text-cyan-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Browse Inventory</p>
                                    <p className="text-xs text-slate-500">{inventoryCount} parts available</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {lowStockCount > 0 && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-orange-800">Low Stock Alert</p>
                                    <p className="text-xs text-orange-500">{lowStockCount} part{lowStockCount > 1 ? 's' : ''} running low</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mini inventory summary */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Inventory Overview</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                <p className="text-xl font-bold text-slate-800">{inventoryCount}</p>
                                <p className="text-xs text-slate-500">Total Parts</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                <p className="text-xl font-bold text-slate-800">{droneCount}</p>
                                <p className="text-xs text-slate-500">Active Drones</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Requests ── */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recent Part Requests</h2>
                        <Link to="/dashboard/cart" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                            <PlusCircle className="h-3.5 w-3.5" /> New Request
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="bg-slate-100 rounded-full p-4 mb-3">
                                <ShoppingCart className="h-7 w-7 text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No requests yet</p>
                            <p className="text-slate-400 text-xs mt-1">Start by raising a part request</p>
                            <Link to="/dashboard/cart"
                                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                                <PlusCircle className="h-3.5 w-3.5" /> Raise Request
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recent.map((req, i) => {
                                const { color, Icon } = statusMeta(req.status);
                                const d = new Date(req.updated_at || req.created_at);
                                const dateStr = `${pad(d.getDate())} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`;
                                const timeStr = `${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
                                return (
                                    <div key={req.id}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                                        <div className="flex-shrink-0 bg-slate-100 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {req.drone_number} <span className="text-slate-400 font-normal">·</span> <span className="text-xs text-slate-500 font-normal">{req.uin_number}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {Array.isArray(req.items) ? req.items.map(it => it.part_name || it.part_id).join(', ') : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                                                <Icon className="h-3 w-3" />
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </span>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{dateStr} · {timeStr}</p>
                                            {/* Withdraw — only on pending */}
                                            {req.status === 'pending' && (
                                                <button
                                                    onClick={() => withdrawRequest(req.id)}
                                                    className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-200"
                                                >
                                                    <Trash2 className="h-3 w-3" /> Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
