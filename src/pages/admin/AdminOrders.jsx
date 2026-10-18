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
  not_confirmed: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  confirmed:     'bg-green-500/20 text-green-400 border border-green-500/40',
  sent:          'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  cancelled:     'bg-red-500/20 text-red-400 border border-red-500/40',
  pending:       'bg-amber-500/20 text-amber-400 border border-amber-500/40',
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

// Pleasant sound chime using native browser Web Audio API (zero audio file downloads)
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
  const style = STATUS_STYLES[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
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
  let cardBorder = 'border-[#2a2a2a]'
  let cardBg = 'bg-[#111111]'

  if (isPriority) {
    cardBorder = 'border-[#FFFFFF] shadow-[0_0_20px_rgba(255, 255, 255,0.18)]'
    cardBg = 'bg-[#16140c]'
  } else if (order.payment_status === 'confirmed') {
    cardBorder = 'border-green-500/30'
    cardBg = 'bg-[#0d160f]'
  } else if (order.payment_status === 'sent') {
    cardBorder = 'border-blue-500/30'
    cardBg = 'bg-[#0b121b]'
  } else if (order.payment_status === 'cancelled') {
    cardBorder = 'border-red-500/25 opacity-75'
    cardBg = 'bg-[#150d0d]'
  }

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg transition-all border ${cardBorder} ${cardBg} relative`}>
      {/* Top Bar for Priority Badge */}
      {isPriority && (
        <div className="bg-[#FFFFFF] text-[#111111] px-4 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
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
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Order ID</p>
              <button
                type="button"
                onClick={() => onTogglePriority(order.id)}
                title={isPriority ? 'Remove Priority' : 'Mark as Priority'}
                className={`p-1 rounded-md transition-all ${
                  isPriority
                    ? 'text-[#FFFFFF] hover:text-yellow-300'
                    : 'text-gray-500 hover:text-[#FFFFFF]'
                }`}
              >
                <Star size={14} className={isPriority ? 'fill-[#FFFFFF]' : ''} />
              </button>
            </div>
            <p className="text-xs font-mono text-[#FFFFFF] font-semibold">
              #{String(order.id).slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{formattedDate}</p>
          </div>

          {/* Customer */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Customer</p>
            <p className="text-sm text-white font-medium">{order.customer_name || '—'}</p>
            <div className="flex items-center gap-1 mt-1">
              <Phone size={11} className="text-gray-500" />
              <p className="text-[11px] text-gray-400">{order.contact || '—'}</p>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Delivery Address</p>
            <p className="text-xs text-gray-300 leading-snug">
              {order.address || '—'}
              {order.pincode ? `, ${order.pincode}` : ''}
            </p>
            {order.landmark && (
              <p className="text-[11px] text-gray-500 mt-0.5">Near: {order.landmark}</p>
            )}
          </div>

          {/* Totals */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Total</p>
            <p className="text-sm font-bold text-[#FFFFFF]">
              Rs. {Number(order.total || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
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
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                >
                  <Check size={13} />
                  <span>Confirm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('cancelled', 'Order cancelled')}
                  disabled={updating}
                  className="flex items-center gap-1 bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
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
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                >
                  <Truck size={13} />
                  <span>Mark as Sent</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('cancelled', 'Order cancelled')}
                  disabled={updating}
                  className="flex items-center gap-1 bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                >
                  <Ban size={12} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('not_confirmed', 'Moved back to Not Confirmed')}
                  disabled={updating}
                  title="Undo to Not Confirmed"
                  className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5"
                >
                  <RotateCcw size={13} />
                </button>
              </>
            )}

            {/* If SENT */}
            {order.payment_status === 'sent' && (
              <>
                <span className="text-[11px] text-blue-400 flex items-center gap-1 mr-1">
                  <Truck size={12} /> Dispatched
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('confirmed', 'Moved back to Confirmed')}
                  disabled={updating}
                  className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded bg-[#1e1e1e] border border-white/10"
                >
                  Back to Confirmed
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('cancelled', 'Order cancelled')}
                  disabled={updating}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-950/50"
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
                className="flex items-center gap-1 bg-[#222] hover:bg-[#333] border border-white/20 text-gray-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              >
                <RotateCcw size={12} />
                <span>Reopen Order</span>
              </button>
            )}

            {/* View / Hide Items Toggle */}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-xs text-[#FFFFFF] hover:text-yellow-300 transition-colors font-medium ml-1"
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
        <div className="border-t border-[#2a2a2a] bg-[#0c0c0c] px-4 sm:px-5 py-4">
          {order.order_items && order.order_items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-500 uppercase tracking-widest border-b border-[#1f1f1f]">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Size</th>
                    <th className="pb-2 pr-4">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {order.order_items.map((item, idx) => (
                    <tr key={idx} className="text-gray-300">
                      <td className="py-2 pr-4 font-medium text-white">
                        {item.product_name || item.products?.name || 'Custom T-Shirt'}
                      </td>
                      <td className="py-2 pr-4">{item.size || '—'}</td>
                      <td className="py-2 pr-4">{item.quantity}</td>
                      <td className="py-2 text-right text-[#FFFFFF] font-semibold">
                        Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-xs text-center py-2">No item breakdown found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(() => {
    const fromParam = searchParams.get('tab')
    return (fromParam && (STATUS_TABS.includes(fromParam) || fromParam === 'Priority')) ? fromParam : 'All'
  })

  // Synchronize activeTab if URL query param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && (STATUS_TABS.includes(tabParam) || tabParam === 'Priority')) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleTabSelect = (tab) => {
    setActiveTab(tab)
    if (tab === 'All') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('tab')
      setSearchParams(nextParams)
    } else {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('tab', tab)
      setSearchParams(nextParams)
    }
  }
  const [sortBy, setSortBy] = useState('priority') // 'priority' | 'newest' | 'highest'
  const [priorities, setPriorities] = useState(() => {
    try {
      const stored = localStorage.getItem('s2_order_priorities')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Live alert banner state
  const [newOrderAlert, setNewOrderAlert] = useState(null)
  const knownOrderIdsRef = useRef(new Set())

  // Save priority changes to localStorage
  const togglePriority = (orderId) => {
    setPriorities((prev) => {
      const next = { ...prev, [orderId]: !prev[orderId] }
      try {
        localStorage.setItem('s2_order_priorities', JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }

  // ── Prune Sent & Cancelled orders older than 14 days ──────────────────────
  const purgeStaleOrders = async (allOrders) => {
    const twoWeeksAgo = Date.now() - FOURTEEN_DAYS_MS
    const staleOrders = (allOrders || []).filter((o) => {
      const isStaleStatus = o.payment_status === 'sent' || o.payment_status === 'cancelled'
      const orderDate = new Date(o.created_at).getTime()
      return isStaleStatus && orderDate < twoWeeksAgo
    })

    if (staleOrders.length > 0) {
      const staleIds = staleOrders.map((o) => o.id)
      try {
        // Attempt to clean from Supabase
        await supabase.from('orders').delete().in('id', staleIds)
      } catch (err) {
        console.warn('Auto-pruning database notice:', err)
      }
      // Return list excluding stale orders
      return allOrders.filter((o) => !staleIds.includes(o.id))
    }
    return allOrders
  }

  // Manual cleanup button
  const handleManualPrune = async () => {
    const twoWeeksAgo = Date.now() - FOURTEEN_DAYS_MS
    const staleOrders = orders.filter((o) => {
      const isStale = o.payment_status === 'sent' || o.payment_status === 'cancelled'
      return isStale && new Date(o.created_at).getTime() < twoWeeksAgo
    })

    if (staleOrders.length === 0) {
      toast.success('No Sent or Cancelled orders older than 2 weeks found.')
      return
    }

    const toastId = toast.loading(`Clearing ${staleOrders.length} stale order(s)...`)
    try {
      const staleIds = staleOrders.map((o) => o.id)
      await supabase.from('orders').delete().in('id', staleIds)
      setOrders((prev) => prev.filter((o) => !staleIds.includes(o.id)))
      toast.success(`Cleared ${staleOrders.length} orders older than 2 weeks!`, { id: toastId })
    } catch {
      toast.error('Could not clean old orders from database.', { id: toastId })
    }
  }

  // ── Fetch Orders ─────────────────────────────────────────────────────────
  const fetchOrders = async (showLoading = true, isBackground = false) => {
    if (showLoading) setLoading(true)
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError || !ordersData || ordersData.length === 0) {
        setOrders([])
        if (showLoading) setLoading(false)
        return
      }

      // Check for newly arrived orders during background polling
      if (isBackground && knownOrderIdsRef.current.size > 0) {
        const brandNewOrders = ordersData.filter(
          (o) => !knownOrderIdsRef.current.has(o.id) && o.payment_status === 'not_confirmed'
        )
        if (brandNewOrders.length > 0) {
          const newest = brandNewOrders[0]
          playOrderChime()
          setNewOrderAlert(newest)
          toast.success(
            `New Order! #${String(newest.id).slice(0, 8).toUpperCase()} from ${newest.customer_name || 'Customer'}`,
            { duration: 8000 }
          )
        }
      }

      // Update known IDs
      ordersData.forEach((o) => knownOrderIdsRef.current.add(o.id))

      // Clean out orders in Sent / Cancelled older than 14 days
      const cleanedOrders = await purgeStaleOrders(ordersData)

      // Fetch items in parallel
      const ordersWithItems = await Promise.all(
        cleanedOrders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*, products(name)')
            .eq('order_id', order.id)

          const normalizedItems = (items || []).map((item) => ({
            ...item,
            product_name: item.product_name || item.products?.name || 'Custom T-Shirt',
          }))

          return { ...order, order_items: normalizedItems }
        })
      )

      setOrders(ordersWithItems)
    } catch {
      setOrders([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Initial load + Realtime listener + Polling fallback
  useEffect(() => {
    fetchOrders(true)

    // 1. Supabase Realtime Channel
    let channel = null
    try {
      channel = supabase
        .channel('admin_realtime_orders')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload) => {
            playOrderChime()
            setNewOrderAlert(payload.new)
            toast.success(
              `New Order Received! #${String(payload.new.id).slice(0, 8).toUpperCase()} from ${payload.new.customer_name || 'Customer'}`,
              { duration: 9000 }
            )
            fetchOrders(false)
          }
        )
        .subscribe()
    } catch (_) {
      // Realtime setup fallback
    }

    // 2. Periodic polling every 15s to guarantee fresh notifications
    const pollInterval = setInterval(() => {
      fetchOrders(false, true)
    }, 15000)

    return () => {
      clearInterval(pollInterval)
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
    )
  }

  // Filter by Active Tab
  const tabFiltered = orders.filter((o) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Pending') {
      // Must only be in pending if confirmed by admin (awaiting dispatch)
      return o.payment_status === 'confirmed' || o.payment_status === 'pending'
    }
    if (activeTab === 'Not Confirmed') return o.payment_status === 'not_confirmed'
    if (activeTab === 'Confirmed') return o.payment_status === 'confirmed'
    if (activeTab === 'Sent') return o.payment_status === 'sent'
    if (activeTab === 'Cancelled') return o.payment_status === 'cancelled'
    if (activeTab === 'Priority') return Boolean(priorities[o.id])
    return true
  })

  // Sort orders
  const sortedOrders = [...tabFiltered].sort((a, b) => {
    const aPri = priorities[a.id] ? 1 : 0
    const bPri = priorities[b.id] ? 1 : 0

    if (sortBy === 'priority') {
      if (aPri !== bPri) return bPri - aPri
      return new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortBy === 'highest') {
      return (Number(b.total) || 0) - (Number(a.total) || 0)
    }
    return 0
  })

  // Tab counts
  const tabCount = (tab) => {
    if (tab === 'All') return orders.length
    if (tab === 'Pending') {
      return orders.filter((o) => o.payment_status === 'confirmed' || o.payment_status === 'pending').length
    }
    if (tab === 'Not Confirmed') return orders.filter((o) => o.payment_status === 'not_confirmed').length
    if (tab === 'Confirmed') return orders.filter((o) => o.payment_status === 'confirmed').length
    if (tab === 'Sent') return orders.filter((o) => o.payment_status === 'sent').length
    if (tab === 'Cancelled') return orders.filter((o) => o.payment_status === 'cancelled').length
    return 0
  }

  const priorityCount = orders.filter((o) => priorities[o.id]).length

  return (
    <div className="space-y-5">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FFFFFF] tracking-wide font-display">
            Customer Orders
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Manage confirmations, dispatch orders, prioritisation, and auto-cleanup.
          </p>
        </div>

        {/* Clean Stale Orders Notice / Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualPrune}
            title="Clean Sent and Cancelled orders older than 14 days"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 hover:border-[#FFFFFF]/40 text-gray-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Calendar size={13} className="text-[#FFFFFF]" />
            <span>Auto-Clear: 2 Weeks</span>
          </button>
        </div>
      </div>

      {/* ── LIVE NEW ORDER ALERT BANNER ─────────────────────────── */}
      {newOrderAlert && (
        <div className="rounded-xl border border-yellow-500/50 bg-gradient-to-r from-yellow-950/60 via-[#1e1708] to-yellow-950/40 p-4 shadow-[0_0_30px_rgba(255, 255, 255,0.25)] flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#FFFFFF] text-[#111111] flex items-center justify-center shrink-0 font-bold shadow-md">
              <Bell size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-[#FFFFFF] font-black">
                New Order Received Just Now!
              </p>
              <p className="text-sm text-white font-medium truncate">
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
              className="bg-[#FFFFFF] text-[#111111] font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
            >
              View Order
            </button>
            <button
              type="button"
              onClick={() => setNewOrderAlert(null)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg"
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
            let activeStyle = 'bg-[#FFFFFF] border-[#FFFFFF] text-[#111111]'

            if (tab === 'Pending') {
              activeStyle = 'bg-amber-400 border-amber-400 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.35)]'
            } else if (tab === 'Not Confirmed') {
              activeStyle = 'bg-yellow-500 border-yellow-500 text-black'
            } else if (tab === 'Confirmed') {
              activeStyle = 'bg-green-600 border-green-600 text-white'
            } else if (tab === 'Sent') {
              activeStyle = 'bg-blue-600 border-blue-600 text-white'
            } else if (tab === 'Cancelled') {
              activeStyle = 'bg-red-600 border-red-600 text-white'
            }

            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabSelect(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isActive
                    ? activeStyle
                    : 'bg-transparent border-[#2a2a2a] text-gray-400 hover:border-[#FFFFFF] hover:text-[#FFFFFF]'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-black/25 text-current' : 'bg-[#1a1a1a] text-gray-500'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeTab === 'Priority'
                ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#111111]'
                : 'bg-[#1a170a] border-yellow-500/40 text-yellow-400 hover:border-[#FFFFFF]'
            }`}
          >
            <Star size={12} className={activeTab === 'Priority' ? 'fill-current' : 'fill-yellow-400'} />
            <span>Priority</span>
            {priorityCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'Priority' ? 'bg-black/25' : 'bg-yellow-500/20 text-yellow-300'}`}>
                {priorityCount}
              </span>
            )}
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#141414] border border-[#2a2a2a] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FFFFFF] cursor-pointer"
          >
            <option value="priority">Priority First</option>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* ── Auto-Prune 2-Week Notice ────────────────────────────── */}
      <div className="bg-[#121212] border border-white/5 rounded-lg px-3.5 py-2 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <AlertCircle size={13} className="text-[#FFFFFF]" />
          <span>Notice: Completed <strong>Sent</strong> &amp; <strong>Cancelled</strong> orders are automatically cleared after 14 days.</span>
        </span>
        <span className="text-gray-500 hidden sm:inline">Clean database retention active</span>
      </div>

      {/* ── Loading State ───────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[#FFFFFF] border-t-transparent animate-spin" />
          <p className="text-gray-500 text-xs tracking-wider uppercase">Loading orders...</p>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────── */}
      {!loading && sortedOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center rounded-xl border border-white/5 bg-[#101010]">
          <div className="w-14 h-14 rounded-full bg-[#181818] flex items-center justify-center text-gray-600">
            <Package size={26} className="text-[#FFFFFF]/60" />
          </div>
          <p className="text-gray-300 text-sm font-semibold">No orders in this view</p>
          <p className="text-gray-500 text-xs max-w-sm">
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
