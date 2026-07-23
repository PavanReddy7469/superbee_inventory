import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Mail, TrendingUp, ExternalLink, ShoppingBag, Send } from 'lucide-react';
import { aeRequestsAPI, sendRequestsAPI } from '../lib/api';

interface AeRequest {
  id: string;
  drone_number: string;
  uin_number: string;
  items: Array<{ part_id: string; quantity: number; part_name?: string }>;
  requested_by: string;
  status: string;
  created_at: string;
  updated_at?: string;
  email?: string;
}

interface SendRequest {
  id: string;
  part_value: string;
  part_mode: string;
  category_name?: string;
  website: string;
  quantity: number;
  requested_by: string;
  email?: string;
  requested_at: string;
  notes?: string;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

export default function AeRequestsPage() {
  const [activeTab, setActiveTab] = useState<'ae' | 'external'>('ae');

  // AE Requests State
  const [requests, setRequests] = useState<AeRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AeRequest[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn'>('pending');
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, withdrawn: 0 });

  // External Purchase Requests State
  const [sendRequests, setSendRequests] = useState<SendRequest[]>([]);
  const [sendFilter, setSendFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [sendLoading, setSendLoading] = useState(false);

  // Custom modal configuration
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    type: 'confirm' | 'success' | 'error';
  } | null>(null);

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
      type: 'confirm'
    });
    setModalOpen(true);
  };

  const showCustomAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModalConfig({
      title,
      message,
      confirmText: 'OK',
      cancelText: '',
      onConfirm: () => setModalOpen(false),
      type
    });
    setModalOpen(true);
  };

  useEffect(() => {
    fetchRequests();
    fetchSendRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filter]);

  const fetchRequests = async () => {
    try {
      const response = await aeRequestsAPI.getAll();
      const requestsData = response.data.data || response.data;
      setRequests(requestsData);

      const newStats = {
        total: requestsData.length,
        pending: requestsData.filter((r: AeRequest) => r.status === 'pending').length,
        approved: requestsData.filter((r: AeRequest) => r.status === 'approved').length,
        rejected: requestsData.filter((r: AeRequest) => r.status === 'rejected').length,
        withdrawn: requestsData.filter((r: AeRequest) => r.status === 'withdrawn').length
      };
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching AE requests:', err);
    }
  };

  const fetchSendRequests = async () => {
    setSendLoading(true);
    try {
      const res = await sendRequestsAPI.getAll();
      const list = res.data.data || res.data || [];
      setSendRequests(list);
    } catch (err) {
      console.error('Error fetching send requests:', err);
    } finally {
      setSendLoading(false);
    }
  };

  const filterRequests = () => {
    if (filter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === filter));
    }
  };

  const acceptRequest = (req: AeRequest) => {
    showCustomConfirm(
      'Approve Request',
      `Accept this request from ${req.requested_by}?\nThis will automatically decrease inventory parts.`,
      async () => {
        try {
          setLoadingId(req.id);
          setModalOpen(false);
          await aeRequestsAPI.accept(req.id);
          await fetchRequests();
          showCustomAlert('Request Approved', '✅ Request approved!\n✓ Inventory updated', 'success');
        } catch (err: any) {
          console.error('Error accepting request:', err);
          showCustomAlert('Approval Failed', err.response?.data?.error || 'Failed to accept request.', 'error');
        } finally {
          setLoadingId(null);
        }
      }
    );
  };

  const rejectRequest = (req: AeRequest) => {
    showCustomConfirm(
      'Decline Request',
      `Reject this request from ${req.requested_by}?`,
      async () => {
        try {
          setLoadingId(req.id);
          setModalOpen(false);
          await aeRequestsAPI.reject(req.id);
          await fetchRequests();
          showCustomAlert('Request Rejected', '❌ Request rejected!', 'success');
        } catch (err: any) {
          console.error('Error rejecting request:', err);
          showCustomAlert('Rejection Failed', err.response?.data?.error || 'Failed to reject request.', 'error');
        } finally {
          setLoadingId(null);
        }
      }
    );
  };

  const handleUpdateSendStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    showCustomConfirm(
      `${newStatus === 'approved' ? 'Approve' : 'Reject'} Purchase Request`,
      `Are you sure you want to mark this external purchase request as ${newStatus}?`,
      async () => {
        try {
          setModalOpen(false);
          await sendRequestsAPI.updateStatus(id, newStatus);
          await fetchSendRequests();
          showCustomAlert(
            `Request ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
            `Status updated to ${newStatus}.`,
            'success'
          );
        } catch (err: any) {
          console.error('Error updating status:', err);
          showCustomAlert('Update Failed', err.response?.data?.error || 'Failed to update status', 'error');
        }
      }
    );
  };

  const filteredSendRequests = sendFilter === 'all'
    ? sendRequests
    : sendRequests.filter(s => s.status === sendFilter);

  const sendPendingCount = sendRequests.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Procurement & Purchase Requests</h1>
          <p className="text-slate-600 mt-1">Manage internal assembly engineer inventory requests & external website purchase requests</p>
        </div>

        {/* Main Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm font-medium">
          <button
            onClick={() => setActiveTab('ae')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'ae'
                ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>AE Inventory Requests</span>
            {stats.pending > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pending}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('external')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'external'
                ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>External Purchase Requests</span>
            {sendPendingCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{sendPendingCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── TAB 1: AE INVENTORY REQUESTS ── */}
      {activeTab === 'ae' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Requests</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold mt-2">{stats.pending}</p>
                </div>
                <Clock className="h-10 w-10 text-amber-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold mt-2">{stats.approved}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold mt-2">{stats.rejected}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-200" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
              <button
                onClick={() => setFilter('withdrawn')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'withdrawn'
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Withdrawn ({stats.withdrawn})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({stats.total})
              </button>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Mail className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No requests found</h3>
                <p className="text-slate-600">No requests match the selected status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="px-6 py-4">Drone Info</th>
                      <th className="px-6 py-4">Requested By</th>
                      <th className="px-6 py-4">Items Requested</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{req.drone_number}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">UIN: {req.uin_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{req.requested_by}</div>
                          {req.email && <div className="text-xs text-slate-500">{req.email}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {req.items.map((item, i) => (
                              <div key={i} className="text-xs bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block mr-1 mb-1">
                                <span className="font-semibold text-slate-800">{item.part_name || item.part_id}</span>
                                <span className="text-indigo-600 font-bold ml-1.5">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {new Date(req.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            req.status === 'approved' ? 'bg-green-100 text-green-800' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => acceptRequest(req)}
                                disabled={loadingId === req.id}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectRequest(req)}
                                disabled={loadingId === req.id}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB 2: EXTERNAL PURCHASE REQUESTS ── */}
      {activeTab === 'external' && (
        <>
          {/* Status Sub-filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setSendFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  sendFilter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({sendRequests.filter(s => s.status === 'pending').length})
              </button>
              <button
                onClick={() => setSendFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  sendFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Approved ({sendRequests.filter(s => s.status === 'approved').length})
              </button>
              <button
                onClick={() => setSendFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  sendFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Rejected ({sendRequests.filter(s => s.status === 'rejected').length})
              </button>
              <button
                onClick={() => setSendFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  sendFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({sendRequests.length})
              </button>
            </div>

            <button
              onClick={fetchSendRequests}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              🔄 Refresh List
            </button>
          </div>

          {/* External Purchase Requests Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
            {sendLoading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading requests...</div>
            ) : filteredSendRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Send className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No external purchase requests</h3>
                <p className="text-slate-600">Technician website purchase requests will appear here once submitted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="px-6 py-4">Part Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Purchase / Website Link</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Requested By</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredSendRequests.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{item.part_value}</div>
                          <div className="text-xs text-slate-500 capitalize">Type: {item.part_mode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200 font-medium">
                            {item.category_name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <a
                            href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium truncate max-w-full"
                          >
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{item.website}</span>
                          </a>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">
                          x{item.quantity}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{item.requested_by}</div>
                          {item.email && <div className="text-xs text-slate-500">{item.email}</div>}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {new Date(item.requested_at || item.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            item.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateSendStatus(item.id, 'approved')}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateSendStatus(item.id, 'rejected')}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {modalOpen && modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{modalConfig.title}</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line mb-6">{modalConfig.message}</p>
            <div className="flex justify-end gap-3">
              {modalConfig.cancelText && (
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                onClick={modalConfig.onConfirm}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
