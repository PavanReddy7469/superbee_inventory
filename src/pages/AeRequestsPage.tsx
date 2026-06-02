import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Mail, TrendingUp } from 'lucide-react';
import { aeRequestsAPI } from '../lib/api';

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

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

export default function AeRequestsPage() {
  const [requests, setRequests] = useState<AeRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AeRequest[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn'>('pending');
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, withdrawn: 0 });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filter]);

  const fetchRequests = async () => {
    try {
      const response = await aeRequestsAPI.getAll();
      const requestsData = response.data;
      setRequests(requestsData);

      // Calculate stats
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

  const filterRequests = () => {
    if (filter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === filter));
    }
  };

  const sendEmail = async (email: string, status: 'approved' | 'rejected', requestDetails: AeRequest) => {
    // Email sending logic - for now, we'll just log it
    console.log(`Email would be sent to ${email}:`);
    console.log(`Request ${status.toUpperCase()}`);
    console.log(`Drone: ${requestDetails.drone_number}`);
    console.log(`UIN: ${requestDetails.uin_number}`);

    // TODO: Implement actual email sending using an email service
    // For example: SendGrid, AWS SES, or your backend API
  };

  const acceptRequest = async (req: AeRequest) => {
    if (!confirm(`Accept this request from ${req.requested_by}?\nThis will automatically decrease inventory parts.`)) return;

    try {
      setLoadingId(req.id);

      // Call API to accept request (backend handles inventory decrement)
      await aeRequestsAPI.accept(req.id);

      // Send email notification
      if (req.email) {
        await sendEmail(req.email, 'approved', req);
      }

      await fetchRequests();
      alert('✅ Request approved!\n✓ Inventory updated\nℹ️ Email notification logged (mocked)');
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('❌ Failed to accept request. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const rejectRequest = async (req: AeRequest) => {
    if (!confirm(`Reject this request from ${req.requested_by}?`)) return;

    try {
      setLoadingId(req.id);

      // Call API to reject request
      await aeRequestsAPI.reject(req.id);

      // Send email notification
      if (req.email) {
        await sendEmail(req.email, 'rejected', req);
      }

      await fetchRequests();
      alert('❌ Request rejected!\nℹ️ Email notification logged (mocked)');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('❌ Failed to reject request. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Procurement Requests</h1>
          <p className="text-slate-600 mt-1">Manage assembly engineer part requests</p>
        </div>
      </div>

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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'approved'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'rejected'
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Rejected ({stats.rejected})
          </button>
          <button
            onClick={() => setFilter('withdrawn')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'withdrawn'
                ? 'bg-slate-200 text-slate-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Withdrawn ({stats.withdrawn})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            All ({stats.total})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Mail className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No requests found</h3>
            <p className="text-slate-500">
              {filter === 'pending'
                ? 'No pending requests at the moment.'
                : filter === 'approved'
                  ? 'No approved requests yet.'
                  : filter === 'rejected'
                    ? 'No rejected requests yet.'
                    : filter === 'withdrawn'
                      ? 'No withdrawn requests yet.'
                      : 'No requests have been raised yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Drone Number</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">UIN</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Parts Requested</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Requested By</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, index) => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{req.drone_number}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{req.uin_number}</td>
                    <td className="py-3 px-4 text-sm">
                      {Array.isArray(req.items) ? (
                        <div className="space-y-1">
                          {req.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-slate-700">
                              <span className="font-medium">{item.part_name || item.part_id}</span>
                              <span className="text-slate-500"> (Qty: {item.quantity})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{req.requested_by}</td>
                    <td className="py-3 px-4">
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : req.status === 'withdrawn'
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {req.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {req.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {req.status === 'withdrawn' && <XCircle className="h-3 w-3 mr-1 text-slate-500" />}
                        {req.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      {/* Date & Time below badge */}
                      {(() => {
                        const ts = (req.status !== 'pending' && req.updated_at) ? req.updated_at : req.created_at;
                        const d = new Date(ts);
                        return (
                          <div className="mt-1">
                            <span className="text-xs text-slate-500">
                              {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="ml-1.5 text-xs text-slate-400">
                              {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">
                      {new Date(req.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                      <div className="text-xs text-slate-400">
                        {new Date(req.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            disabled={loadingId === req.id}
                            onClick={() => acceptRequest(req)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            {loadingId === req.id ? (
                              <span>Processing...</span>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            disabled={loadingId === req.id}
                            onClick={() => rejectRequest(req)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            {loadingId === req.id ? (
                              <span>Processing...</span>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                <span>Decline</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-slate-400">No action</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
