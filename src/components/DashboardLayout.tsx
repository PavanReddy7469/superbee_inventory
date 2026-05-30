import { useState, ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShoppingCart,
  User
} from 'lucide-react';
import logo from '../assets/superbee.png';

interface MenuItem {
  label: string;
  path?: string;
  icon: ReactNode;
  children?: MenuItem[];
  roles?: string[];
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['inventory']);
  const { profile, signOut } = useAuth();
  const { items } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['superadmin', 'admin']
    },
    {
      label: 'Manage Assembly Engineers',
      icon: <Users className="h-5 w-5" />,
      roles: ['superadmin', 'admin'],
      children: [
        {
          label: 'Assembly Engineers',
          path: '/dashboard/buyers',
          icon: <User className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        }
      ]
    },
    {
      label: 'Manage Inventory',
      icon: <Package className="h-5 w-5" />,
      children: [
        {
          label: 'Manage Category',
          path: '/dashboard/categories',
          icon: <Package className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        },
        {
          label: 'Inventory',
          path: '/dashboard/inventory',
          icon: <Package className="h-5 w-5" />
        },
        {
          label: 'Register New Part',
          path: '/dashboard/inventory/register',
          icon: <Package className="h-5 w-5" />,
          // Only admins/superadmins can register new parts
          roles: ['superadmin', 'admin']
        }
      ]
    },

    // Cart visible only to technicians
    {
      label: 'Cart',
      path: '/dashboard/cart',
      icon: <ShoppingCart className="h-5 w-5" />,
      roles: ['technician']
    },
    {
      label: 'Send Requests',
      path: '/dashboard/send-request',
      icon: <ShoppingCart className="h-5 w-5" />,
      roles: ['technician']
    },
    {
      label: 'Manage Drone',
      icon: <ShoppingCart className="h-5 w-5" />,
      roles: ['superadmin', 'admin'],
      children: [
        {
          label: 'Drone',
          path: '/dashboard/drones',
          icon: <ShoppingCart className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        },
        {
          label: 'Add Drone',
          path: '/dashboard/drones/add',
          icon: <ShoppingCart className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        },
        {
          label: 'Manage Drone Type',
          path: '/dashboard/drone-types',
          icon: <ShoppingCart className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        },
        {
          label: 'Procurement Requests',
          path: '/dashboard/ae-requests',
          icon: <ShoppingCart className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        }
      ]
    },
    {
      label: 'Invoice Request',
      icon: <Package className="h-5 w-5" />,
      roles: ['superadmin', 'admin'],
      children: [
        {
          label: 'Generate Invoice Request',
          path: '/dashboard/generate-invoice',
          icon: <Package className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        },
        {
          label: 'Generate PI Request',
          path: '/dashboard/generate-ao',
          icon: <Package className="h-5 w-5" />,
          roles: ['superadmin', 'admin']
        }
      ]
    }
  ];

  const canAccessMenuItem = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    return item.roles.includes(profile?.role?.name || '');
  };

  const renderMenuItem = (item: MenuItem) => {
    if (!canAccessMenuItem(item)) return null;

    const isExpanded = expandedMenus.includes(item.label);
    const isActive = item.path === location.pathname;

    if (item.children) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {isExpanded && (
            <div className="ml-8 mt-1 space-y-1">
              {item.children.map(child => {
                if (!canAccessMenuItem(child)) return null;
                const childActive = child.path === location.pathname;
                return (
                  <Link
                    key={child.label}
                    to={child.path || '#'}
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${childActive
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path || '#'}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors mb-1 ${isActive
          ? 'text-cyan-400 bg-cyan-500/10'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
      >
        {item.icon}
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <img
              src={logo}
              alt="Superbee Aeronautics"
              className="h-12 w-auto"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Menu</div>
            <nav className="space-y-1">
              {menuItems.map(item => renderMenuItem(item))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <div className="text-sm font-medium text-slate-900">{profile?.name}</div>
              <div className="text-xs text-slate-500">{profile?.email}</div>
              <div className="text-xs text-cyan-600 mt-1 capitalize">{profile?.role?.name}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Live Date & Time removed for demo */}

            <div className="flex items-center space-x-4 ml-auto">
              {/* Cart icon for technicians */}
              {profile?.role?.name === 'technician' && (
                <Link to="/dashboard/cart" className="relative">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                    <ShoppingCart className="h-5 w-5 text-slate-700" />
                  </div>
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{items.length}</span>
                  )}
                </Link>
              )}

              <div className="hidden md:flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{
                    profile?.role?.name
                      ? (profile.role.name.charAt(0).toUpperCase() + profile.role.name.slice(1))
                      : 'User'
                  }</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <div>{new Date().getFullYear()} © SuperBee Aeronautics</div>
            <div>Designed and Maintained by SuperBee Aeronautics</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
