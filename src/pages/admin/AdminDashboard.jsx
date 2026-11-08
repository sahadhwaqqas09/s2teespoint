import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ShoppingBag, Package, Tag, LayoutDashboard, TrendingUp, Image as ImageIcon } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, to }) => {
  const content = (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8DED1',
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 8px rgba(38, 23, 16, 0.04)',
        transition: 'all 0.2s ease',
        cursor: to ? 'pointer' : 'default',
      }}
      className="hover:border-[#8C5E43] hover:shadow-md"
    >
      <div
        style={{
          background: '#FAF6F0',
          border: '1px solid #DECFC0',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={26} color="#784E38" strokeWidth={1.8} />
      </div>
      <div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#261710',
            lineHeight: 1,
            marginBottom: '6px',
            fontFamily: 'monospace',
          }}
        >
          {value === null ? '--' : value}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6F584A', fontWeight: '600', letterSpacing: '0.03em' }}>
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
    not_confirmed: { bg: '#FDF5E6', color: '#9A6700', border: '#E6CD97', label: 'Not Confirmed' },
    confirmed:     { bg: '#EAF2EB', color: '#20522B', border: '#BCD4BF', label: 'Confirmed' },
    sent:          { bg: '#EBF2FA', color: '#1D4ED8', border: '#BFDBFE', label: 'Sent' },
    cancelled:     { bg: '#FDF0ED', color: '#8C2E24', border: '#F3C4BE', label: 'Cancelled' },
    pending:       { bg: '#FDF5E6', color: '#9A6700', border: '#E6CD97', label: 'Pending' },
  }
  const s = config[status?.toLowerCase()] || { bg: '#FAF6F0', color: '#5C4537', border: '#DECFC0', label: status || 'Unknown' }
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
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
    {
      icon: ImageIcon,
      label: 'Hero Slides',
      value: 'Edit',
      to: '/admin/banners',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EC', color: '#261710' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <LayoutDashboard size={26} color="#784E38" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#261710', margin: 0, fontFamily: 'Cinzel, serif' }}>
            Admin Dashboard
          </h1>
        </div>
        <p style={{ color: '#6F584A', fontSize: '0.95rem', margin: 0, paddingLeft: '38px' }}>
          Assalamu Alaikum, Admin. Here is a quick look at your store today.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}
      >
        {statCards.map((card) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} to={card.to} />
        ))}
      </div>

      {/* Recent Orders */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8DED1',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(38, 23, 16, 0.04)',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E8DED1',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#FAF6F0',
          }}
        >
          <ShoppingBag size={20} color="#784E38" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#261710', fontFamily: 'Cinzel, serif' }}>
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
              <tr style={{ background: '#FAF6F0' }}>
                {['Order ID', 'Customer Name', 'Contact', 'Total (Rs.)', 'Status', 'Date'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      color: '#784E38',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid #E8DED1',
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
                    style={{ padding: '40px', textAlign: 'center', color: '#8A7465' }}
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: '40px', textAlign: 'center', color: '#8A7465' }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    style={{
                      background: idx % 2 === 0 ? '#FFFFFF' : '#FAF6F0',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F0E8DE')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAF6F0')
                    }
                  >
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#784E38',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        borderBottom: '1px solid #E8DED1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {truncateId(order.id)}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#261710',
                        fontWeight: '500',
                        borderBottom: '1px solid #E8DED1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.customer_name || '—'}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#5C4537',
                        borderBottom: '1px solid #E8DED1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.contact || '—'}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#261710',
                        fontWeight: '700',
                        borderBottom: '1px solid #E8DED1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.total != null ? `Rs. ${Number(order.total).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        borderBottom: '1px solid #E8DED1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td
                      style={{
                        padding: '13px 20px',
                        color: '#8A7465',
                        borderBottom: '1px solid #E8DED1',
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
