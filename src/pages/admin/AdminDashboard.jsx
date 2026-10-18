import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ShoppingBag, Package, Tag, LayoutDashboard, TrendingUp } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, to }) => {
  const content = (
    <div
      style={{
        background: 'linear-gradient(135deg, #181818 0%, #0f0f0f 100%)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        borderRadius: '12px',
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.2s ease',
        cursor: to ? 'pointer' : 'default',
      }}
      className="hover:border-[#FFD700] hover:scale-[1.02]"
    >
      <div
        style={{
          background: 'rgba(255, 215, 0, 0.12)',
          borderRadius: '10px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={26} color="#FFD700" strokeWidth={1.8} />
      </div>
      <div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#FFD700',
            lineHeight: 1,
            marginBottom: '6px',
            fontFamily: 'monospace',
          }}
        >
          {value === null ? '--' : value}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: '500', letterSpacing: '0.03em' }}>
          {label}
        </div>
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {content}
      </Link>
    )
  }
  return content
}

const StatusBadge = ({ status }) => {
  const config = {
    not_confirmed: { bg: 'rgba(234,179,8,0.15)', color: '#facc15', border: 'rgba(234,179,8,0.4)', label: 'Not Confirmed' },
    confirmed:     { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.4)', label: 'Confirmed' },
    sent:          { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.4)', label: 'Sent' },
    cancelled:     { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.4)', label: 'Cancelled' },
    pending:       { bg: 'rgba(234,179,8,0.15)', color: '#facc15', border: 'rgba(234,179,8,0.4)', label: 'Pending' },
  }
  const s = config[status?.toLowerCase()] || { bg: '#33333322', color: '#aaa', border: '#555', label: status || 'Unknown' }
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '0.75rem',
        fontWeight: '600',
        letterSpacing: '0.04em',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const truncateId = (id) => {
  if (!id) return '—'
  return `#${String(id).slice(0, 8).toUpperCase()}`
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: null,
    pendingOrders: null,
    totalProducts: null,
    totalCategories: null,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!supabase) {
          setStats({ totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalCategories: 0 })
          setLoadingStats(false)
          return
        }

        const [
          { count: totalOrders },
          { count: pendingOrders },
          { count: totalProducts },
          { count: totalCategories },
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('payment_status', ['confirmed', 'pending']),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
        ])

        setStats({
          totalOrders: totalOrders ?? 0,
          pendingOrders: pendingOrders ?? 0,
          totalProducts: totalProducts ?? 0,
          totalCategories: totalCategories ?? 0,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setStats({ totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalCategories: 0 })
      } finally {
        setLoadingStats(false)
      }
    }

    const fetchRecentOrders = async () => {
      try {
        if (!supabase) {
          setRecentOrders([])
          setLoadingOrders(false)
          return
        }

        const { data, error } = await supabase
          .from('orders')
          .select('id, customer_name, contact, total, payment_status, created_at')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setRecentOrders(data || [])
      } catch (err) {
        console.error('Error fetching recent orders:', err)
        setRecentOrders([])
      } finally {
        setLoadingOrders(false)
      }
    }

    fetchStats()
    fetchRecentOrders()
  }, [])

  const statCards = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: loadingStats ? null : stats.totalOrders,
      to: '/admin/orders',
    },
    {
      icon: TrendingUp,
      label: 'Pending Orders',
      value: loadingStats ? null : stats.pendingOrders,
      to: '/admin/orders?tab=Pending',
    },
    {
      icon: Package,
      label: 'Total Products',
      value: loadingStats ? null : stats.totalProducts,
      to: '/admin/products',
    },
    {
      icon: Tag,
      label: 'Total Categories',
      value: loadingStats ? null : stats.totalCategories,
      to: '/admin/categories',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f0f0f0', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <LayoutDashboard size={28} color="#b8963e" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f5c842', margin: 0 }}>
            Admin Dashboard
          </h1>
        </div>
        <p style={{ color: '#aaa', fontSize: '0.95rem', margin: 0, paddingLeft: '40px' }}>
          Assalamu Alaikum, Admin. Here is a quick look at your store today.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {statCards.map((card) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} to={card.to} />
        ))}
      </div>

      {/* Recent Orders */}
      <div
        style={{
          background: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #2a2a2a',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <ShoppingBag size={20} color="#b8963e" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#f5c842' }}>
            Recent Orders
          </h2>
        </div>

        {/* Scrollable Table */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              minWidth: '640px',
              borderCollapse: 'collapse',
              fontSize: '0.88rem',
            }}
          >
            <thead>
              <tr style={{ background: '#1a1a1a' }}>
                {['Order ID', 'Customer Name', 'Contact', 'Total (Rs.)', 'Status', 'Date'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      color: '#b8963e',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid #2a2a2a',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: '40px', textAlign: 'center', color: '#555' }}
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: '40px', textAlign: 'center', color: '#555' }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    style={{
                      background: idx % 2 === 0 ? '#111' : '#131313',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = idx % 2 === 0 ? '#111' : '#131313')
                    }
                  >
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#f5c842',
                        fontFamily: 'monospace',
                        fontWeight: '600',
                        borderBottom: '1px solid #1e1e1e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {truncateId(order.id)}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#f0f0f0',
                        borderBottom: '1px solid #1e1e1e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.customer_name || '—'}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#ccc',
                        borderBottom: '1px solid #1e1e1e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.contact || '—'}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#4ade80',
                        fontWeight: '600',
                        borderBottom: '1px solid #1e1e1e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.total != null ? `Rs. ${Number(order.total).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        borderBottom: '1px solid #1e1e1e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#888',
                        borderBottom: '1px solid #1e1e1e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
