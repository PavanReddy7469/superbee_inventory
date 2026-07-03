import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, X, Send, ArrowLeft } from 'lucide-react';
import logo from '../assets/superbee.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.role?.name === 'technician') {
        navigate('/dashboard/inventory', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  // Rate limiting lockout state
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  useEffect(() => {
    if (lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      // If forced password change flow is active
      if (result.requiresPasswordChange) {
        if (result.role === 'technician') {
          navigate('/dashboard/inventory');
        } else {
          navigate('/dashboard');
        }
        return;
      }

      if (result.role === 'technician') {
        navigate('/dashboard/inventory');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Too many login attempts') || err.message.includes('15 min') || err.message.includes('429'))) {
        setError('Too many login attempts. Please try again in 15 minutes.');
        setLockoutTime(900); // 15 minutes client lock
      } else {
        setError(err.message || 'Invalid email or password');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus('sending');
    // Simulate sending reset email (replace with real API call as needed)
    await new Promise((r) => setTimeout(r, 1500));
    setForgotStatus('sent');
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">

        {/* ── Logo & Branding ── */}
        <div className="text-center mb-8">
          {/* Logo with glow ring */}
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-125 animate-pulse" />
            <div className="relative bg-slate-800/80 border border-slate-600/60 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
              <img
                src={logo}
                alt="Superbee Aeronautics"
                className="h-16 w-auto mx-auto drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              />
            </div>
          </div>

          {/* Brand name */}
          <h1 className="text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
            Superbee Aeronautics
          </h1>
          <p className="text-xs text-slate-500 tracking-widest uppercase mb-4">Inventory Management Portal</p>

          {/* Welcome heading */}
          <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Welcome Back 👋</h2>
          <p className="text-slate-400 text-sm">Sign in to access your workspace</p>
        </div>

        {/* ── Login Card ── */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                {/* ── Forgot Password Link ── */}
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || lockoutTime > 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : lockoutTime > 0 ? (
                `Locked out for ${formatTime(lockoutTime)}`
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <a href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Homepage
            </a>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          &copy; {new Date().getFullYear()} Superbee Aeronautics. All rights reserved.
        </p>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeForgotModal}
          />

          {/* Modal card */}
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl z-10 animate-fade-in">

            {/* Close button */}
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {forgotStatus !== 'sent' ? (
              <>
                <div className="mb-5">
                  <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl mb-4 mx-auto">
                    <Mail className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-1">Reset Password</h3>
                  <p className="text-slate-400 text-sm text-center">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotStatus === 'sending'}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotStatus === 'sending' ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <button
                  onClick={closeForgotModal}
                  className="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              /* ── Success state ── */
              <div className="text-center py-4">
                <div className="flex items-center justify-center w-14 h-14 bg-green-500/10 border border-green-500/30 rounded-full mb-4 mx-auto">
                  <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Check your inbox!</h3>
                <p className="text-slate-400 text-sm mb-6">
                  We've sent a password reset link to<br />
                  <span className="text-cyan-400 font-medium">{forgotEmail}</span>
                </p>
                <button
                  onClick={closeForgotModal}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
