import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Check local demo admin session first
    const isDemo = sessionStorage.getItem('s2_admin_demo') === 'true';
    if (isDemo) {
      setSession({ user: { email: 'admin@s2teespoint.com' }, isDemo: true });
      return;
    }

    // Otherwise check Supabase session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
    }).catch(() => {
      setSession(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!sessionStorage.getItem('s2_admin_demo')) {
        setSession(currentSession);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
