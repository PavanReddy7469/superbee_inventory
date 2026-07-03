import { useEffect, useState } from 'react';
import { usersAPI } from '../lib/api';
import { Search, Edit, Trash2, UserPlus } from 'lucide-react';
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
  // editingUser is not currently used; keep as placeholder for future edit functionality
  // const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
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
      // FIX-17: Backend returns paginated response { data: [...], total, page, limit, totalPages }
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();



    try {
      const userData = {
        ...formData,
        role_name: userType
      };

      await usersAPI.create(userData);

      // Attempt to send login details (dev: show modal + console.log; prod: try to invoke an email function)
      await sendLoginDetails(formData.email, formData.password);

      alert(`${userType === 'admin' ? 'Admin' : 'Assembly Engineer'} created successfully! Login credentials sent to ${formData.email}`);

      setShowModal(false);
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
      console.error('Error creating user:', error);
      alert(error.response?.data?.error || error.message || 'Error creating user');
    }
  };

  // Sends login credentials to the created user.
  // Dev behavior: show a modal with the credentials and log to console.
  // Production behavior: placeholder to call a server-side email sender (edge function / SMTP).
  const sendLoginDetails = async (email: string, password: string) => {
    // Compose message (can be replaced with HTML/template)
    const subject = 'Your Superbee Inventory Portal credentials';
    const body = `Hello,\n\nYour account has been created for the Superbee Inventory Portal.\n\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after first login.\n\nRegards,\nSuperbee Admin`;

    if (import.meta.env.DEV) {
      // Show modal with credentials for local testing and log to console.
      console.info('DEV: Mock sending credentials to', email);
      console.info('Subject:', subject);
      console.info('Body:\n', body);
      setSentCredentials({ email, password });
      setSendModal(true);
      return;
    }

    try {
      // Production: attempt to call a Supabase Edge Function named `send-email` (needs to be implemented),
      // or replace this block with an API call to your email provider (SendGrid, SES, SMTP server, etc.).
      // Example (uncomment if you have an edge function):
      // await supabase.functions.invoke('send-email', { body: { to: email, subject, message: body } });

      // Fallback: if no email sending integration is configured, log and alert.
      console.info('PROD: Email sending is not configured. Credentials for', email, 'are:\n', body);
      alert('Email sending is not configured on this deployment. Contact the administrator.');
    } catch (err) {
      console.error('Error sending credentials:', err);
      alert('Failed to send credentials via email. Please send them manually.');
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await usersAPI.updateStatus(userId, !currentStatus);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersAPI.delete(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
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
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Technicians
          </button>
          <button
            onClick={() => setUserType('admin')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              userType === 'admin'
                ? 'bg-indigo-600 text-white'
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
              onClick={() => {
                // prepare form for new engineer
                setFormData({
                  name: '',
                  email: '',
                  mobile_number: '',
                  employee_id: '',
                  designation: '',
                  password: 'Superbee@123'
                });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
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
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employee ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Designation</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mobile</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{user.employee_id}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{user.designation}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{user.mobile_number || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors"
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        title="Delete"
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Add New {userType === 'admin' ? 'Admin' : 'Assembly Engineer'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Default Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">User can change this later</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Login credentials will be automatically sent to the provided email address.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      name: '',
                      email: '',
                      mobile_number: '',
                      employee_id: '',
                      designation: '',
                      password: 'Superbee@123'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dev-only modal to show sent credentials when sendLoginDetails is used in DEV */}
      {sendModal && sentCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  setSendModal(false);
                  setSentCredentials(null);
                }}
                className="px-4 py-2 border rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
