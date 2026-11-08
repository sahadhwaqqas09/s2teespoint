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
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Back to store */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6F584A] hover:text-[#261710] transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Visit Main Site
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] border border-[#DECFC0] shadow-md p-8">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 bg-[#3D261C] text-[#F7F3EC] font-black text-xl mb-3 shadow-md">
              S2
            </div>
            <h1 className="text-2xl font-bold text-[#261710] tracking-tight font-serif">
              Admin Portal
            </h1>
            <p className="text-[#784E38] text-xs uppercase tracking-widest mt-1 font-semibold">
              Store &amp; Inventory Management
            </p>
            <div className="w-12 h-0.5 bg-[#8C5E43] mt-3" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C4537] uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@s2teespoint.com"
                className="w-full bg-[#FAF6F0] border border-[#D5C2AE] text-[#261710] placeholder-[#8A7465] px-4 py-2.5 text-sm focus:outline-none focus:border-[#784E38] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4537] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF6F0] border border-[#D5C2AE] text-[#261710] placeholder-[#8A7465] px-4 py-2.5 text-sm focus:outline-none focus:border-[#784E38] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 font-semibold text-sm text-[#F7F3EC] bg-[#3D261C] hover:bg-[#543729] active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {loading ? 'Authenticating...' : 'Sign In with Supabase'}
            </button>
          </form>

          {/* Quick Demo Preview Option */}
          <div className="mt-6 pt-6 border-t border-[#DECFC0]">
            <p className="text-xs text-[#6F584A] text-center mb-3">
              Testing before Supabase connection?
            </p>
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2.5 px-4 text-xs font-semibold border border-[#8C5E43] text-[#784E38] hover:bg-[#3D261C] hover:text-[#F7F3EC] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              Instant Admin Preview Mode
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#8A7465] text-xs mt-6">
          &copy; {new Date().getFullYear()} S2 Teespoint. All rights reserved.
        </p>
      </div>
    </div>
  );
}
