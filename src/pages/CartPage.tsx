import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { aeRequestsAPI } from '../lib/api';
import { ShoppingCart, Trash2, Plus, Minus, Send, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear } = useCart();
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Procurement Cart</h1>
          <p className="text-slate-600 mt-0.5">Raise parts requests for assembly and maintenance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                <span>Cart Items ({items.length})</span>
              </h2>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) clear();
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            <div className="p-5">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-indigo-50 text-indigo-600 rounded-full p-4 w-14 h-14 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-semibold">Your procurement cart is empty</p>
                  <p className="text-slate-400 text-xs mt-1">Browse parts from the inventory to request them</p>
                  <button 
                    onClick={() => navigate('/dashboard/inventory')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Browse Inventory
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <div key={item.part.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{item.part.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">SKU: <span className="font-semibold">{item.part.sku}</span> · Mfg: {item.part.manufacturer}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                          title="Decrease Quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                          title="Increase Quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.part.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Procurement Request details */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <h2 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3">Request Details</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Drone Number *
                </label>
                <input
                  type="text"
                  value={droneNumber}
                  onChange={(e) => setDroneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. SUPERBEE-D1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  UIN / Register Number *
                </label>
                <input
                  type="text"
                  value={uin}
                  onChange={(e) => setUin(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. UIN-42354A"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Unique Parts:</span>
                <span className="font-semibold text-slate-800">{items.length}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Items Qty:</span>
                <span className="font-semibold text-slate-800">{totalItems}</span>
              </div>
              <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-sm text-slate-850">
                <span>Requested By:</span>
                <span className="text-slate-800 font-semibold">{user?.name || 'Engineer'}</span>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={loading || items.length === 0}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
