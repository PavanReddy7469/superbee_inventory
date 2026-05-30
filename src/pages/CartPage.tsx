import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { aeRequestsAPI } from '../lib/api';

export default function CartPage() {
  const { items, clear } = useCart();
  const [droneNumber, setDroneNumber] = useState('');
  const [uin, setUin] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleSend = async () => {
    if (!droneNumber.trim() || !uin.trim()) return alert('Please enter Drone Number and UIN');
    if (items.length === 0) return alert('Cart is empty');
    setLoading(true);
    try {
      const requestData = {
        drone_number: droneNumber,
        uin_number: uin,
        items: items.map(i => ({ 
          part_id: i.part.sku, 
          part_name: i.part.name, 
          quantity: i.quantity 
        })),
        requested_by: user?.name || 'Assembly Engineer',
        email: user?.email || 'ae@superbee.com'
      };

      await aeRequestsAPI.create(requestData);

      alert('✅ Request sent successfully!');
      clear();
      setDroneNumber('');
      setUin('');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error sending AE request:', err);
      alert('❌ Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AE Cart</h1>
      </div>

      <div className="bg-white rounded-xl p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium">Drone Number</label>
          <input value={droneNumber} onChange={(e) => setDroneNumber(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">UIN Number</label>
          <input value={uin} onChange={(e) => setUin(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Items ({totalItems})</h3>
          <div className="mt-2">
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">Cart is empty</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-700">
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.part.id} className="border-t">
                      <td className="py-2 text-sm">{i.part.sku}</td>
                      <td className="py-2 text-sm">{i.part.name}</td>
                      <td className="py-2 text-sm">{i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Sending...' : 'Send Request'}</button>
          <button onClick={() => clear()} className="px-4 py-2 border rounded">Clear Cart</button>
        </div>
      </div>
    </div>
  );
}
