import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 text-center">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full mb-6 mx-auto">
            <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-6">
            You don't have permission to view this page. If you believe this is an error, please contact your administrator.
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-red-400 hover:to-amber-500 transition-all duration-200 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
