import { useEffect, useState } from 'react';
import { aeRequestsAPI } from '../lib/api';

interface AeRequest {
  id: string;
  drone_number: string;
  uin_number: string;
  items: Array<{ part_id: string; part_name?: string; quantity: number }>;
  requested_by: string;
  status: string;
  created_at: string;
}

export default function PoRequestPage() {
  const [requests, setRequests] = useState<AeRequest[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await aeRequestsAPI.getAll();
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching AE requests:', err);
    }
  };

  const acceptRequest = async (req: AeRequest) => {
    if (!confirm('Accept this request and decrement inventory parts?')) return;
    try {
      setLoadingId(req.id);
      await aeRequestsAPI.accept(req.id);
      fetchRequests();
      alert('✅ Request accepted and inventory updated successfully!');
    } catch (err: any) {
      console.error('Error accepting request:', err);
      alert(err.response?.data?.error || 'Failed to accept request');
    } finally {
      setLoadingId(null);
    }
  };

  const rejectRequest = async (req: AeRequest) => {
    if (!confirm('Reject this request?')) return;
    try {
      setLoadingId(req.id);
      await aeRequestsAPI.reject(req.id);
      fetchRequests();
      alert('✅ Request rejected successfully!');
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      alert(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AE Request</h1>
      </div>

      <div className="bg-white p-6 rounded-xl">
        {requests.length === 0 ? (
          <p className="text-slate-500">No AE requests yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Drone</th>
                <th>UIN</th>
                <th>Items</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{r.drone_number}</td>
                  <td className="py-2">{r.uin_number}</td>
                  <td className="py-2 text-sm">
                    {Array.isArray(r.items) ? (
                      <ul className="list-disc ml-5">
                        {r.items.map((it: any, idx: number) => (
                          <li key={idx}>{it.part_id} (x{it.quantity})</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{JSON.stringify(r.items)}</span>
                    )}
                  </td>
                  <td className="py-2">{r.requested_by}</td>
                  <td className="py-2 capitalize">{r.status}</td>
                  <td className="py-2 text-sm">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-2">
                    {r.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button disabled={loadingId === r.id} onClick={() => acceptRequest(r)} className="px-3 py-1 bg-green-600 text-white rounded">{loadingId === r.id ? '...' : 'Accept'}</button>
                        <button disabled={loadingId === r.id} onClick={() => rejectRequest(r)} className="px-3 py-1 bg-red-600 text-white rounded">{loadingId === r.id ? '...' : 'Reject'}</button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
