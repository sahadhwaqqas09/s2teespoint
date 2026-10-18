import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LayoutDashboard, Tag, Package, ShoppingBag, Settings, LogOut, Menu, X, ExternalLink } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/settings', label: 'Store Info', icon: Settings },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unconfirmedCount, setUnconfirmedCount] = useState(0)
  const navigate = useNavigate()

  // Track unconfirmed orders for notification badge
  useEffect(() => {
    const fetchUnconfirmed = async () => {
      try {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'not_confirmed')
        setUnconfirmedCount(count || 0)
      } catch (_) {}
    }
    fetchUnconfirmed()
    const interval = setInterval(fetchUnconfirmed, 12000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    sessionStorage.removeItem('s2_admin_demo')
    try { await supabase.auth.signOut() } catch { /* ignore */ }
    navigate('/admin/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 20 }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className="admin-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: '240px',
          backgroundColor: '#0a0a0a',
          borderRight: '1px solid #FFD700',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Sidebar Brand */}
        <div style={{
          padding: '20px 18px 14px',
          borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: '#FFD700',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '14px', color: '#000',
              fontFamily: 'Cinzel, serif',
              flexShrink: 0,
            }}>S2</div>
            <div>
              <p style={{ color: '#FFD700', fontWeight: 700, fontSize: '13px', margin: 0, letterSpacing: '0.05em' }}>
                S2 Teespoint
              </p>
              <p style={{ color: '#666', fontSize: '10px', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="sidebar-close-btn"
            style={{ background: 'none', border: 'none', color: '#FFD700', cursor: 'pointer', display: 'none' }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                color: isActive ? '#000' : '#aaa',
                backgroundColor: isActive ? '#FFD700' : 'transparent',
                border: isActive ? 'none' : '1px solid transparent',
                transition: 'all 0.15s ease',
                letterSpacing: '0.02em',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.backgroundColor.includes('255, 215')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'
                  e.currentTarget.style.color = '#FFD700'
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.25)'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.style.backgroundColor.includes('255, 215')) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#aaa'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {label === 'Orders' && unconfirmedCount > 0 && (
                    <span
                      style={{
                        backgroundColor: isActive ? '#000' : '#FFD700',
                        color: isActive ? '#FFD700' : '#111',
                        fontSize: '10px',
                        fontWeight: 900,
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unconfirmedCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Visit Main Site */}
        <div style={{ padding: '0 10px 8px' }}>
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px',
              textDecoration: 'none',
              background: 'rgba(255, 215, 0, 0.06)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              color: '#FFD700', fontSize: '13px', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.15)'
              e.currentTarget.style.borderColor = '#FFD700'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)'
            }}
          >
            <ExternalLink size={15} />
            <span>Visit Main Site</span>
          </Link>
        </div>

        {/* Logout */}
        <div style={{ padding: '0 10px 16px', borderTop: '1px solid rgba(255,215,0,0.1)', paddingTop: '8px', marginTop: '4px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              background: 'none', border: '1px solid rgba(255,80,80,0.25)',
              color: '#f87171', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 80, 80, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(255,80,80,0.5)'
              e.currentTarget.style.color = '#fca5a5'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.borderColor = 'rgba(255,80,80,0.25)'
              e.currentTarget.style.color = '#f87171'
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="admin-main">

        {/* Top bar */}
        <header style={{
          height: '58px',
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid #FFD700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 20px rgba(255, 215, 0, 0.06)',
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            style={{ background: 'none', border: 'none', color: '#FFD700', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
            aria-label="Toggle sidebar"
          >
            <Menu size={22} />
          </button>

          {/* Title */}
          <h1 style={{
            color: '#FFD700',
            fontSize: '15px',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '0.06em',
            fontFamily: 'Cinzel, serif',
            textTransform: 'uppercase',
          }}>
            S2 Teespoint Admin
          </h1>

          {/* Top right: Visit Main Site only */}
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '6px',
              background: 'rgba(255, 215, 0, 0.08)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#FFD700', fontSize: '12px', fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FFD700'
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.08)'
              e.currentTarget.style.color = '#FFD700'
            }}
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Visit Main Site</span>
          </Link>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: '24px',
          color: '#ffffff',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 100%)',
        }}>
          <Outlet />
        </main>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar {
            transform: translateX(0) !important;
            position: relative !important;
            height: auto !important;
          }
          .sidebar-close-btn { display: none !important; }
          .admin-main { margin-left: 0; }
        }
        @media (max-width: 767px) {
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
