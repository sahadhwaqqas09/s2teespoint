import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
  ChevronDown,
  ChevronUp,
  Package,
  Phone,
  Check,
  Truck,
  Ban,
  RotateCcw,
  Star,
  Bell,
  Trash2,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react'

// Tabs available on top of page: includes Pending (all orders not sent and not cancelled)
const STATUS_TABS = ['All', 'Pending', 'Not Confirmed', 'Confirmed', 'Sent', 'Cancelled']

const STATUS_STYLES = {
  not_confirmed: 'bg-[#FDF5E6] text-[#9A6700] border border-[#E6CD97]',
  confirmed:     'bg-[#EAF2EB] text-[#20522B] border border-[#BCD4BF]',
  sent:          'bg-[#EBF2FA] text-[#1D4ED8] border border-[#BFDBFE]',
  cancelled:     'bg-[#FDF0ED] text-[#8C2E24] border border-[#F3C4BE]',
  pending:       'bg-[#FDF5E6] text-[#9A6700] border border-[#E6CD97]',
}

const STATUS_LABELS = {
  not_confirmed: 'Not Confirmed',
  confirmed:     'Confirmed',
  sent:          'Sent',
  cancelled:     'Cancelled',
  pending:       'Pending',
}

// 14 days in milliseconds
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000

// Pleasant sound chime using native browser Web Audio API
function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch (_) {
    // Audio autoplay restrictions or headless env
  }
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-[#FAF6F0] text-[#5C4537] border border-[#DECFC0]'
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold ${style}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function OrderCard({ order, onStatusChange, isPriority, onTogglePriority }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleUpdateStatus = async (newStatus, successMessage) => {
    setUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('id', order.id)

    setUpdating(false)
    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(successMessage || `Order updated to ${STATUS_LABELS[newStatus] || newStatus}`)
      onStatusChange(order.id, newStatus)
    }
  }

  const formattedDate = new Date(order.created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Border & background based on status and priority
  let cardBorder = 'border-[#E8DED1]'
  let cardBg = 'bg-[#FFFFFF]'

  if (isPriority) {
    cardBorder = 'border-[#8C5E43] shadow-md'
    cardBg = 'bg-[#FAF6F0]'
  } else if (order.payment_status === 'confirmed') {
    cardBorder = 'border-[#BCD4BF]'
    cardBg = 'bg-[#FAFDFB]'
  } else if (order.payment_status === 'sent') {
    cardBorder = 'border-[#BFDBFE]'
    cardBg = 'bg-[#F8FAFC]'
  } else if (order.payment_status === 'cancelled') {
    cardBorder = 'border-[#F3C4BE] opacity-80'
    cardBg = 'bg-[#FDFBFB]'
  }

  return (
    <div className={`overflow-hidden shadow-sm transition-all border ${cardBorder} ${cardBg} relative`}>
      {/* Top Bar for Priority Badge */}
      {isPriority && (
        <div className="bg-[#3D261C] text-[#F7F3EC] px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Star size={11} className="fill-current" />
            HIGH PRIORITY ORDER
          </span>
          <span>Handle First</span>
        </div>
      )}

      {/* Order Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Order ID + Date */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] uppercase tracking-widest text-[#784E38] font-semibold">Order ID</p>
              <button
                type="button"
                onClick={() => onTogglePriority(order.id)}
                title={isPriority ? 'Remove Priority' : 'Mark as Priority'}
                className={`p-1 transition-all ${
                  isPriority
                    ? 'text-[#784E38]'
                    : 'text-[#8A7465] hover:text-[#784E38]'
                }`}
              >
                <Star size={14} className={isPriority ? 'fill-[#784E38]' : ''} />
              </button>
            </div>
            <p className="text-xs font-mono text-[#261710] font-bold">
              #{String(order.id).slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px] text-[#8A7465] mt-1">{formattedDate}</p>
          </div>

          {/* Customer */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#784E38] font-semibold mb-1">Customer</p>
            <p className="text-sm text-[#261710] font-medium">{order.customer_name || '—'}</p>
            <div className="flex items-center gap-1 mt-1">
              <Phone size={11} className="text-[#784E38]" />
              <p className="text-[11px] text-[#5C4537]">{order.contact || '—'}</p>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#784E38] font-semibold mb-1">Delivery Address</p>
            <p className="text-xs text-[#5C4537] leading-snug">
              {order.address || '—'}
              {order.pincode ? `, ${order.pincode}` : ''}
            </p>
            {order.landmark && (
              <p className="text-[11px] text-[#8A7465] mt-0.5">Near: {order.landmark}</p>
            )}
          </div>

          {/* Totals */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#784E38] font-semibold mb-1">Total</p>
            <p className="text-sm font-bold text-[#261710]">
              Rs. {Number(order.total || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-[#8A7465] mt-1">
              Delivery: Rs. {Number(order.delivery_charge || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Status Badge + Action Buttons */}
        <div className="flex flex-col sm:items-end gap-2.5 min-w-[200px]">
          <div className="flex items-center gap-2">
            <StatusBadge status={order.payment_status} />
          </div>

          {/* Dynamic Action Buttons based on status */}
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            {/* If NOT CONFIRMED */}
            {order.payment_status === 'not_confirmed' && (
              <>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('confirmed', 'Order confirmed!')}
                  disabled={updating}
                  className="flex items-center gap-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 transition-all shadow-sm"
                >
                  <Check size={13} />
                  <span>Confirm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('cancelled', 'Order cancelled')}
                  disabled={updating}
                  className="flex items-center gap-1 bg-[#FDF0ED] hover:bg-red-100 border border-[#F3C4BE] text-[#8C2E24] text-xs font-semibold px-2.5 py-1.5 transition-all"
                >
                  <Ban size={12} />
                  <span>Cancel</span>
                </button>
              </>
            )}

            {/* If CONFIRMED */}
            {order.payment_status === 'confirmed' && (
              <>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('sent', 'Order marked as Sent!')}
                  disabled={updating}
                  className="flex items-center gap-1 bg-[#3D261C] hover:bg-[#543729] disabled:opacity-50 text-[#F7F3EC] text-xs font-bold px-3 py-1.5 transition-all shadow-sm"
                >
                  <Truck size={13} />
                  <span>Mark as Sent</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('cancelled', 'Order cancelled')}
                  disabled={updating}
                  className="flex items-center gap-1 bg-[#FDF0ED] hover:bg-red-100 border border-[#F3C4BE] text-[#8C2E24] text-xs font-semibold px-2.5 py-1.5 transition-all"
                >
                  <Ban size={12} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('not_confirmed', 'Moved back to Not Confirmed')}
                  disabled={updating}
                  title="Undo to Not Confirmed"
                  className="p-1.5 text-[#8A7465] hover:text-[#261710] hover:bg-[#FAF6F0]"
                >
                  <RotateCcw size={13} />
                </button>
              </>
            )}

            {/* If SENT */}
            {order.payment_status === 'sent' && (
              <>
                <span className="text-[11px] text-[#1D4ED8] font-semibold flex items-center gap-1 mr-1">
                  <Truck size={12} /> Dispatched
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('confirmed', 'Moved back to Confirmed')}
                  disabled={updating}
                  className="text-xs text-[#5C4537] hover:text-[#261710] px-2.5 py-1 bg-[#FAF6F0] border border-[#D5C2AE]"
                >
                  Back to Confirmed
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('cancelled', 'Order cancelled')}
                  disabled={updating}
                  className="text-xs text-red-700 hover:text-red-800 px-2 py-1 bg-red-50 border border-red-200"
                >
                  Cancel
                </button>
              </>
            )}

            {/* If CANCELLED */}
            {order.payment_status === 'cancelled' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('not_confirmed', 'Order reopened!')}
                disabled={updating}
                className="flex items-center gap-1 bg-[#FAF6F0] hover:bg-[#EFE7DC] border border-[#D5C2AE] text-[#3D261C] text-xs font-medium px-3 py-1.5 transition-all"
              >
                <RotateCcw size={12} />
                <span>Reopen Order</span>
              </button>
            )}

            {/* View / Hide Items Toggle */}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-xs text-[#784E38] hover:text-[#261710] transition-colors font-semibold ml-1"
            >
              <Package size={13} />
              <span>{expanded ? 'Hide' : 'Items'}</span>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Items Section */}
      {expanded && (
        <div className="border-t border-[#E8DED1] bg-[#FAF6F0] px-4 sm:px-5 py-4">
          {order.order_items && order.order_items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[#784E38] uppercase tracking-widest border-b border-[#DECFC0] font-semibold">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Size</th>
                    <th className="pb-2 pr-4">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DED1]">
                  {order.order_items.map((item, idx) => (
                    <tr key={idx} className="text-[#5C4537]">
                      <td className="py-2.5 pr-4 font-semibold text-[#261710]">
                        {item.product_name || item.products?.name || 'Custom T-Shirt'}
                      </td>
                      <td className="py-2.5 pr-4">{item.size || '—'}</td>
                      <td className="py-2.5 pr-4">{item.quantity}</td>
                      <td className="py-2.5 text-right text-[#261710] font-bold">
                        Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#8A7465] text-xs text-center py-2">No item breakdown found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromQuery = searchParams.get('tab')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'Pending')
  const [priorities, setPriorities] = useState(() => {
    try {
      const stored = localStorage.getItem('s2_order_priorities')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })
  const [sortBy, setSortBy] = useState('priority')
  const [newOrderAlert, setNewOrderAlert] = useState(null)
  const previousOrderCount = useRef(null)

  // Persist priorities
  useEffect(() => {
    try {
      localStorage.setItem('s2_order_priorities', JSON.stringify(priorities))
    } catch (_) {}
  }, [priorities])

  const togglePriority = (orderId) => {
    setPriorities((prev) => {
      const next = { ...prev }
      if (next[orderId]) {
        delete next[orderId]
        toast.success('Priority removed')
      } else {
        next[orderId] = true
        toast.success('Marked as High Priority!')
      }
      return next
    })
  }

  // 14-day auto retention cleanup helper
  const pruneStaleOrders = async (currentOrders) => {
    const now = Date.now()
    const staleOrders = currentOrders.filter((o) => {
      const isTerminal = o.payment_status === 'sent' || o.payment_status === 'cancelled'
      if (!isTerminal) return false
      const createdTime = new Date(o.created_at).getTime()
      return now - createdTime > FOURTEEN_DAYS_MS
    })

    if (staleOrders.length === 0) return currentOrders

    const staleIds = staleOrders.map((o) => o.id)
    try {
      await supabase.from('order_items').delete().in('order_id', staleIds)
      await supabase.from('orders').delete().in('id', staleIds)
      return currentOrders.filter((o) => !staleIds.includes(o.id))
    } catch (err) {
      console.warn('Auto cleanup notice:', err)
      return currentOrders
    }
  }

  const fetchOrders = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          contact,
          address,
          landmark,
          pincode,
          delivery_charge,
          total,
          payment_status,
          created_at,
          order_items (
            id,
            size,
            quantity,
            price,
            product_id,
            products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const cleaned = await pruneStaleOrders(data || [])

      // Detect newly received orders during polling
      if (!isInitial && previousOrderCount.current !== null && cleaned.length > previousOrderCount.current) {
        const newest = cleaned[0]
        setNewOrderAlert(newest)
        playOrderChime()
        toast.success(`New order received from ${newest.customer_name || 'customer'}!`, {
          duration: 7000,
          icon: '📦',
        })
      }

      previousOrderCount.current = cleaned.length
      setOrders(cleaned)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(true)
    const interval = setInterval(() => {
      fetchOrders(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Sync tab with URL query parameter
  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery)
    }
  }, [tabFromQuery])

  const handleTabSelect = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'All' ? {} : { tab })
  }

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
    )
  }

  const handleManualPrune = async () => {
    const beforeCount = orders.length
    const pruned = await pruneStaleOrders(orders)
    const removedCount = beforeCount - pruned.length
    setOrders(pruned)
    if (removedCount > 0) {
      toast.success(`Cleaned up ${removedCount} completed orders older than 14 days.`)
    } else {
      toast.success('No orders older than 14 days found to clean up.')
    }
  }

  // Filter based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Pending') {
      return order.payment_status !== 'sent' && order.payment_status !== 'cancelled'
    }
    if (activeTab === 'Not Confirmed') return order.payment_status === 'not_confirmed'
    if (activeTab === 'Confirmed') return order.payment_status === 'confirmed'
    if (activeTab === 'Sent') return order.payment_status === 'sent'
    if (activeTab === 'Cancelled') return order.payment_status === 'cancelled'
    if (activeTab === 'Priority') return Boolean(priorities[order.id])
    return true
  })

  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'priority') {
      const aP = priorities[a.id] ? 1 : 0
      const bP = priorities[b.id] ? 1 : 0
      if (aP !== bP) return bP - aP
      return new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortBy === 'highest') {
      return (b.total || 0) - (a.total || 0)
    }
    return 0
  })

  const tabCount = (tab) => {
    if (tab === 'All') return orders.length
    if (tab === 'Pending') {
      return orders.filter((o) => o.payment_status !== 'sent' && o.payment_status !== 'cancelled').length
    }
    if (tab === 'Not Confirmed') return orders.filter((o) => o.payment_status === 'not_confirmed').length
    if (tab === 'Confirmed') return orders.filter((o) => o.payment_status === 'confirmed').length
    if (tab === 'Sent') return orders.filter((o) => o.payment_status === 'sent').length
    if (tab === 'Cancelled') return orders.filter((o) => o.payment_status === 'cancelled').length
    return 0
  }

  const priorityCount = orders.filter((o) => priorities[o.id]).length

  return (
    <div className="space-y-5 text-[#261710]">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#261710] tracking-wide font-serif">
            Customer Orders
          </h1>
          <p className="text-[#6F584A] text-xs sm:text-sm mt-0.5">
            Manage confirmations, dispatch orders, prioritisation, and auto-cleanup.
          </p>
        </div>

        {/* Clean Stale Orders Notice / Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualPrune}
            title="Clean Sent and Cancelled orders older than 14 days"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6F0] border border-[#D5C2AE] hover:border-[#8C5E43] text-[#3D261C] text-xs font-semibold transition-colors"
          >
            <Calendar size={13} className="text-[#784E38]" />
            <span>Auto-Clear: 2 Weeks</span>
          </button>
        </div>
      </div>

      {/* ── LIVE NEW ORDER ALERT BANNER ─────────────────────────── */}
      {newOrderAlert && (
        <div className="border-2 border-[#8C5E43] bg-[#FAF6F0] p-4 shadow-md flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-[#3D261C] text-[#F7F3EC] flex items-center justify-center shrink-0 font-bold shadow-md">
              <Bell size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-[#784E38] font-black">
                New Order Received Just Now!
              </p>
              <p className="text-sm text-[#261710] font-semibold truncate">
                #{String(newOrderAlert.id).slice(0, 8).toUpperCase()} &bull; {newOrderAlert.customer_name} &bull; Rs. {Number(newOrderAlert.total || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleTabSelect('Not Confirmed')
                setNewOrderAlert(null)
              }}
              className="bg-[#3D261C] text-[#F7F3EC] font-bold text-xs px-3.5 py-1.5 hover:bg-[#543729] transition-colors shadow-sm"
            >
              View Order
            </button>
            <button
              type="button"
              onClick={() => setNewOrderAlert(null)}
              className="p-1.5 text-[#8A7465] hover:text-[#261710]"
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Control Bar: Tabs + Priority Filter + Sorting ───────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab
            let activeStyle = 'bg-[#3D261C] border-[#3D261C] text-[#F7F3EC]'

            if (tab === 'Pending') {
              activeStyle = 'bg-[#B45309] border-[#B45309] text-white font-bold shadow-sm'
            } else if (tab === 'Not Confirmed') {
              activeStyle = 'bg-[#D97706] border-[#D97706] text-white'
            } else if (tab === 'Confirmed') {
              activeStyle = 'bg-[#15803D] border-[#15803D] text-white'
            } else if (tab === 'Sent') {
              activeStyle = 'bg-[#1D4ED8] border-[#1D4ED8] text-white'
            } else if (tab === 'Cancelled') {
              activeStyle = 'bg-[#B91C1C] border-[#B91C1C] text-white'
            }

            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabSelect(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                  isActive
                    ? activeStyle
                    : 'bg-[#FAF6F0] border-[#DECFC0] text-[#5C4537] hover:border-[#8C5E43] hover:text-[#261710]'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-black/20 text-current' : 'bg-[#EFE7DC] text-[#6F584A]'
                  }`}
                >
                  {tabCount(tab)}
                </span>
              </button>
            )
          })}

          {/* Priority Quick Filter */}
          <button
            type="button"
            onClick={() => handleTabSelect(activeTab === 'Priority' ? 'All' : 'Priority')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-all ${
              activeTab === 'Priority'
                ? 'bg-[#784E38] border-[#784E38] text-[#F7F3EC]'
                : 'bg-[#FAF6F0] border-[#DECFC0] text-[#784E38] hover:border-[#8C5E43]'
            }`}
          >
            <Star size={12} className={activeTab === 'Priority' ? 'fill-current' : 'fill-[#784E38]'} />
            <span>Priority</span>
            {priorityCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] ${activeTab === 'Priority' ? 'bg-black/20' : 'bg-[#EFE7DC] text-[#784E38]'}`}>
                {priorityCount}
              </span>
            )}
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#6F584A] font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#FFFFFF] border border-[#DECFC0] text-xs text-[#261710] px-2.5 py-1.5 focus:outline-none focus:border-[#784E38] cursor-pointer"
          >
            <option value="priority">Priority First</option>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* ── Auto-Prune 2-Week Notice ────────────────────────────── */}
      <div className="bg-[#FAF6F0] border border-[#DECFC0] px-3.5 py-2 flex items-center justify-between text-[11px] text-[#6F584A]">
        <span className="flex items-center gap-1.5">
          <AlertCircle size={13} className="text-[#784E38]" />
          <span>Notice: Completed <strong>Sent</strong> &amp; <strong>Cancelled</strong> orders are automatically cleared after 14 days.</span>
        </span>
        <span className="text-[#8A7465] hidden sm:inline">Clean database retention active</span>
      </div>

      {/* ── Loading State ───────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#784E38] border-t-transparent animate-spin" />
          <p className="text-[#8A7465] text-xs tracking-wider uppercase font-semibold">Loading orders...</p>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────── */}
      {!loading && sortedOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-[#DECFC0] bg-[#FAF6F0] p-6">
          <div className="w-14 h-14 bg-[#EFE7DC] flex items-center justify-center text-[#784E38]">
            <Package size={26} className="text-[#784E38]" />
          </div>
          <p className="text-[#261710] text-sm font-semibold">No orders in this view</p>
          <p className="text-[#6F584A] text-xs max-w-sm">
            {activeTab === 'All'
              ? 'No customer orders placed yet. Orders placed via WhatsApp will appear here automatically.'
              : activeTab === 'Priority'
              ? 'No orders currently flagged as priority. Click the star icon on any order to prioritize it.'
              : `No orders currently with status "${activeTab}".`}
          </p>
        </div>
      )}

      {/* ── Orders List ─────────────────────────────────────────── */}
      {!loading && sortedOrders.length > 0 && (
        <div className="flex flex-col gap-3.5">
          {sortedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isPriority={Boolean(priorities[order.id])}
              onTogglePriority={togglePriority}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
