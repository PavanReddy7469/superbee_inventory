import { useEffect, useState } from 'react';
import { usersAPI } from '../lib/api';
import { Search, Edit, Trash2, UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  employee_id: string;
  designation: string;
  is_active: boolean;
  role: {
    name: string;
    level: number;
  };
}

export default function BuyersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'admin' | 'technician'>('technician');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_number: '',
    employee_id: '',
    designation: '',
    password: 'Superbee@123'
  });
  const [sendModal, setSendModal] = useState(false);
  const [sentCredentials, setSentCredentials] = useState<{ email: string; password: string } | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll(userType);
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      mobile_number: '',
      employee_id: '',
      designation: '',
      password: 'Superbee@123'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile_number: user.mobile_number || '',
      employee_id: user.employee_id || '',
      designation: user.designation || '',
      password: '' // empty means leave password unchanged
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Edit flow
        const updatePayload: any = {
          name: formData.name,
          email: formData.email,
          mobile_number: formData.mobile_number,
          employee_id: formData.employee_id,
          designation: formData.designation,
          role_name: userType
        };
        if (formData.password && formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }

        await usersAPI.update(editingUser.id, updatePayload);
        alert(`User details for ${formData.name} updated successfully!`);
      } else {
        // Create flow
        const userData = {
          ...formData,
          role_name: userType
        };

        await usersAPI.create(userData);
        await sendLoginDetails(formData.email, formData.password);
        alert(`${userType === 'admin' ? 'Admin' : 'Assembly Engineer'} created successfully! Login credentials sent to ${formData.email}`);
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        mobile_number: '',
        employee_id: '',
        designation: '',
        password: 'Superbee@123'
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.error || error.message || 'Error saving user');
    }
  };

  const sendLoginDetails = async (email: string, password: string) => {
    const subject = 'Your Superbee Inventory Portal credentials';
    const body = `Hello,\n\nYour account has been created for the Superbee Inventory Portal.\n\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after first login.\n\nRegards,\nSuperbee Admin`;

    if (import.meta.env.DEV) {
      console.info('DEV: Mock sending credentials to', email);
      setSentCredentials({ email, password });
      setSendModal(true);
      return;
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await usersAPI.updateStatus(userId, !currentStatus);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      alert(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersAPI.delete(userId);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || error.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.employee_id && user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canManageAdmins = profile?.role?.name === 'admin' || profile?.role?.name === 'superadmin';
  const canManageTechnicians = profile?.role?.name === 'admin' || profile?.role?.name === 'superadmin';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard / Manage Assembly Engineers</h1>
      </div>

      {canManageAdmins && (
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setUserType('technician')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              userType === 'technician'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Technicians
          </button>
          <button
            onClick={() => setUserType('admin')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              userType === 'admin'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Admins
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-slate-900">
            {userType === 'admin' ? 'Admin Users' : 'Assembly Engineers'}
          </h2>
          {((userType === 'admin' && canManageAdmins) || (userType === 'technician' && canManageTechnicians)) && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add {userType === 'admin' ? 'Admin' : 'Engineer'}</span>
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Employee ID</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Designation</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Mobile</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-mono">{user.employee_id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.designation}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.mobile_number || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        user.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                      title="Click to toggle active/inactive status"
                    >
                      {user.is_active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        title="Edit User Details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingUser ? `Edit ${editingUser.name}` : `Add New ${userType === 'admin' ? 'Admin' : 'Assembly Engineer'}`}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@superbeeaeronautics.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      placeholder="e.g. EMP-001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Flight Engineer / Developer"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {editingUser ? 'New Password (Optional)' : 'Default Password *'}
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Superbee@123'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required={!editingUser}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {editingUser ? 'Leave blank to keep existing password' : 'Must contain uppercase, lowercase, number & special char'}
                    </p>
                  </div>
                </div>

                {!editingUser && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">
                      📧 Welcome email with login credentials will be automatically sent to the provided email address.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({
                      name: '',
                      email: '',
                      mobile_number: '',
                      employee_id: '',
                      designation: '',
                      password: 'Superbee@123'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  {editingUser ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dev-only modal */}
      {sendModal && sentCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Credentials Sent (DEV)</h3>
            <p className="text-sm text-slate-700 mb-4">The following credentials were (mock) sent to the user:</p>
            <div className="bg-slate-100 p-4 rounded mb-4">
              <p className="text-sm"><strong>Email:</strong> {sentCredentials.email}</p>
              <p className="text-sm"><strong>Password:</strong> {sentCredentials.password}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`Email: ${sentCredentials.email}\nPassword: ${sentCredentials.password}`);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  setSendModal(false);
                  setSentCredentials(null);
                }}
                className="px-4 py-2 border rounded-lg text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
