import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Check, X, ShieldAlert } from 'lucide-react';
import logo from '../assets/superbee.png';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { changePassword, profile } = useAuth();
  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  const criteriaMetCount = [hasMinLength, hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: 'Empty', color: 'bg-slate-700', text: 'text-slate-400' };
    if (criteriaMetCount <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (criteriaMetCount <= 4) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-400' };
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-400' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (criteriaMetCount < 5) {
      setError('Password does not meet all complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        // Redirect to technician dashboard or general dashboard based on role
        if (profile?.role?.name === 'technician') {
          navigate('/dashboard/inventory');
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      // Extract actual error from backend response
      const data = err.response?.data;
      const msg = data?.error || (data?.errors?.map((e: any) => e.msg).join(', ')) || err.message || 'Failed to change password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-125 animate-pulse" />
            <div className="relative bg-slate-800/80 border border-slate-600/60 rounded-2xl p-3 shadow-2xl backdrop-blur-sm">
              <img src={logo} alt="Superbee Aeronautics" className="h-12 w-auto mx-auto" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Change Password Required</h2>
          <p className="text-slate-400 text-sm">For security reasons, you must update your password before accessing the system.</p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          {success ? (
            <div className="text-center py-6">
              <div className="flex items-center justify-center w-14 h-14 bg-green-500/10 border border-green-500/30 rounded-full mb-4 mx-auto">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
              <p className="text-slate-400 text-sm">Your password has been changed successfully. Redirecting you to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    placeholder="Enter current password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Strength Meter */}
              {newPassword.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(criteriaMetCount / 5) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Criteria Checklist */}
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-400 mb-1">Password requirements:</p>
                <div className="flex items-center gap-2">
                  {hasMinLength ? <Check className="h-3.5 w-3.5 text-green-400" /> : <X className="h-3.5 w-3.5 text-slate-500" />}
                  <span className={hasMinLength ? 'text-green-400' : 'text-slate-400'}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUpper ? <Check className="h-3.5 w-3.5 text-green-400" /> : <X className="h-3.5 w-3.5 text-slate-500" />}
                  <span className={hasUpper ? 'text-green-400' : 'text-slate-400'}>At least one uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLower ? <Check className="h-3.5 w-3.5 text-green-400" /> : <X className="h-3.5 w-3.5 text-slate-500" />}
                  <span className={hasLower ? 'text-green-400' : 'text-slate-400'}>At least one lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasDigit ? <Check className="h-3.5 w-3.5 text-green-400" /> : <X className="h-3.5 w-3.5 text-slate-500" />}
                  <span className={hasDigit ? 'text-green-400' : 'text-slate-400'}>At least one digit (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSymbol ? <Check className="h-3.5 w-3.5 text-green-400" /> : <X className="h-3.5 w-3.5 text-slate-500" />}
                  <span className={hasSymbol ? 'text-green-400' : 'text-slate-400'}>At least one special character (symbol)</span>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-700/40">
                    {passwordsMatch ? <Check className="h-3.5 w-3.5 text-green-400" /> : <X className="h-3.5 w-3.5 text-slate-500" />}
                    <span className={passwordsMatch ? 'text-green-400' : 'text-slate-400'}>Passwords match</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || criteriaMetCount < 5 || !passwordsMatch}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
