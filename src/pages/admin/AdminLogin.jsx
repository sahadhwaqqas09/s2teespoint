import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message || 'Invalid credentials. Please verify your Supabase user.');
        setLoading(false);
        return;
      }

      sessionStorage.removeItem('s2_admin_demo');
      toast.success('Signed in successfully!');
      navigate('/admin');
    } catch {
      toast.error('Unable to connect to authentication server. Try demo mode below.');
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    sessionStorage.setItem('s2_admin_demo', 'true');
    toast.success('Welcome to S2 Teespoint Admin Preview!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Back to store */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FFD700] transition-colors"
          >
            <ArrowLeft size={14} />
            Visit Main Site
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl p-8">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFD700] text-[#111111] font-black text-xl mb-3 shadow-lg">
              S2
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">
              Store &amp; Inventory Management
            </p>
            <div className="w-12 h-1 bg-[#FFD700] rounded-full mt-3" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@s2teespoint.com"
                className="w-full bg-[#1A1A1A] border border-[#333333] text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] border border-[#333333] text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-lg font-semibold text-sm text-[#111111] bg-[#FFD700] hover:bg-[#FFB800] active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {loading ? 'Authenticating...' : 'Sign In with Supabase'}
            </button>
          </form>

          {/* Quick Demo Preview Option */}
          <div className="mt-6 pt-6 border-t border-[#222222]">
            <p className="text-xs text-gray-400 text-center mb-3">
              Testing before Supabase connection?
            </p>
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-medium border border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700] hover:text-[#111111] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              Instant Admin Preview Mode
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          &copy; {new Date().getFullYear()} S2 Teespoint. All rights reserved.
        </p>
      </div>
    </div>
  );
}
