import { useEffect, useState } from 'react';
import { dashboardAPI, categoriesAPI } from '../lib/api';
import { Package, Users, ShoppingCart, ChevronDown, Tag, Layers } from 'lucide-react';

interface InventoryPart {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  manufacturer: string;
  quantity: number;
  price: number;
  status: string;
}

interface Category {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBuyers: 0,
    totalInventory: 0,
    totalBuyerRequest: 0
  });

  // Format helpers for live clock
  const padZ = (n: number) => String(n).padStart(2, '0');
  const formatTime = (d: Date) => {
    const h = d.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${padZ(h12)}:${padZ(d.getMinutes())}:${padZ(d.getSeconds())} ${ampm}`;
  };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const formatDate = (d: Date) =>
    `${DAYS[d.getDay()]}, ${padZ(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Product dropdown state
  const [categories, setCategories] = useState<Category[]>([]);
  const [allParts, setAllParts] = useState<InventoryPart[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchProductData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProductData = async () => {
    try {
      const [catsResponse, partsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        dashboardAPI.getProducts()
      ]);
      
      const cats = catsResponse.data;
      const parts = partsResponse.data;
      
      // Ensure numeric fields are numbers
      const partsWithNumbers = parts.map((part: any) => ({
        ...part,
        price: Number(part.price) || 0,
        quantity: Number(part.quantity) || 0
      }));
      
      setCategories(cats);
      setAllParts(partsWithNumbers);
      if (cats.length > 0) setSelectedCategory(cats[0].id);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'Select Category';

  // Group products by name to find "same products" (same name/category)
  const filteredParts = allParts.filter(p => p.category_id === selectedCategory);

  // Group by name for "same products" view
  const grouped = filteredParts.reduce<Record<string, InventoryPart[]>>((acc, part) => {
    const key = part.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(part);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">/ Dashboard</p>
        </div>
        {/* Live Clock */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-right">
          <div>
            <p className="text-xs text-slate-400 font-medium">{formatDate(now)}</p>
            <p className="text-xl font-bold tracking-wide text-slate-800 font-mono">{formatTime(now)}</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">Total Buyers</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalBuyers}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-cyan-100 flex items-center justify-center">
              <Users className="h-7 w-7 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">Total Inventory</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalInventory || allParts.length}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-7 w-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">Total Buyer Request</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalBuyerRequest}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Same Products Dropdown Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Same Products</h2>
              <p className="text-xs text-slate-500">Browse inventory by category</p>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium min-w-[200px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {selectedCategoryName}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-[220px] bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <Tag className="h-3.5 w-3.5 opacity-60" />
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product List */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No products in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(grouped).map(([name, items]) => {
              const totalQty = items.reduce((sum, p) => sum + p.quantity, 0);
              const item = items[0];
              return (
                <div
                  key={name}
                  className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      <Package className="h-5 w-5 text-indigo-500" />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${totalQty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {totalQty > 0 ? `${totalQty} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-2 leading-snug">{name}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{item.sku}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-500">{item.manufacturer}</p>
                    <p className="text-sm font-bold text-indigo-600">₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
