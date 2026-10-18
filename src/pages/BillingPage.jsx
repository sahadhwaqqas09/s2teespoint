import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CreditCard, CheckCircle, MessageCircle } from 'lucide-react'
import { useSiteSettings } from '../hooks/useSiteSettings'

import { estimateDelivery } from '../lib/deliveryEstimate'

export default function BillingPage() {
  const settings = useSiteSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const { deliveryCharge: initialDeliveryCharge = 0, pincode: locationPincode = '' } =
    location.state || {}

  const { items, clearCart } = useCartStore()

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    address: '',
    pincode: locationPincode,
    landmark: '',
  })

  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  // ── Dynamically determine delivery charge based on pincode ────────────────
  const calculatedCharge =
    form.pincode?.length === 6 && estimateDelivery(form.pincode).serviceable
      ? estimateDelivery(form.pincode).charge
      : Number(initialDeliveryCharge) || 0

  const deliveryCharge = calculatedCharge

  // ── Derived totals ────────────────────────────────────────────────────────
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const grandTotal = subtotal + Number(deliveryCharge)

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {}

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.'
    }

    if (!/^\d{10}$/.test(form.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number.'
    }

    if (!form.address.trim()) {
      newErrors.address = 'Please enter your delivery address.'
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit pincode.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validate()) return
    if (items.length === 0) {
      toast.error('Your cart is empty!')
      return
    }

    setPlacing(true)

    try {
      // 1. Insert into 'orders' table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: form.fullName.trim(),
            contact: form.mobile.trim(),
            address: form.address.trim(),
            landmark: form.landmark.trim() || null,
            pincode: form.pincode.trim(),
            delivery_charge: Number(deliveryCharge),
            total: grandTotal,
            payment_status: 'not_confirmed',
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      const orderId = orderData.id

      // 2. Insert into 'order_items' table
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.id || item.product?.id,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price || item.product?.price || 0),
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Show success toast
      toast.success(
        'Your order has been placed. We will contact you shortly on WhatsApp to confirm payment.',
        { duration: 6000 }
      )

      setOrderPlaced(true)

      // 4. Clear cart
      clearCart()

      // 5. Navigate home with success message
      setTimeout(() => {
        navigate('/', {
          state: {
            successMessage:
              'Order placed successfully. Our team will reach out on WhatsApp soon. JazakAllah Khair.',
          },
        })
      }, 2500)
    } catch (err) {
      console.error('Order placement error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // ── Order with WhatsApp ───────────────────────────────────────────────────
  const handleOrderWithWhatsApp = async () => {
    if (!validate()) {
      toast.error('Please fill in your name, contact, and delivery address to continue.')
      return
    }
    if (items.length === 0) {
      toast.error('Your cart is empty!')
      return
    }

    setPlacing(true)

    try {
      let orderId = null
      // Attempt to save order into Supabase so admin has record
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              customer_name: form.fullName.trim(),
              contact: form.mobile.trim(),
              address: form.address.trim(),
              landmark: form.landmark.trim() || null,
              pincode: form.pincode.trim(),
              delivery_charge: Number(deliveryCharge),
              total: grandTotal,
              payment_status: 'not_confirmed',
            },
          ])
          .select()
          .single()

        if (!orderError && orderData) {
          orderId = orderData.id
          const orderItems = items.map((item) => ({
            order_id: orderId,
            product_id: item.id || item.product?.id,
            size: item.size,
            quantity: item.quantity,
            price: Number(item.price || item.product?.price || 0),
          }))
          await supabase.from('order_items').insert(orderItems)
        }
      } catch (dbErr) {
        console.warn('Database note:', dbErr)
      }

      // Format WhatsApp order text with zero emojis
      const orderRef = orderId ? `Order Reference: #${String(orderId).slice(0, 8).toUpperCase()}\n` : ''
      const landmarkInfo = form.landmark.trim() ? `\nLandmark: ${form.landmark.trim()}` : ''

      const itemsList = items
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.name} | Size: ${item.size} | Qty: ${item.quantity} | Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`
        )
        .join('\n')

      const message = `Assalamu Alaikum S2 Teespoint,
I would like to place an order:

${orderRef}Customer Details:
Name: ${form.fullName.trim()}
Contact: ${form.mobile.trim()}
Address: ${form.address.trim()}${landmarkInfo}
Pincode: ${form.pincode.trim()}

Order Items:
${itemsList}

Subtotal: Rs. ${subtotal.toLocaleString('en-IN')}
Delivery: ${Number(deliveryCharge) === 0 ? 'FREE' : `Rs. ${Number(deliveryCharge).toLocaleString('en-IN')}`}
Grand Total: Rs. ${grandTotal.toLocaleString('en-IN')}

Please confirm my order and share payment instructions. JazakAllah Khair.`

      const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`

      // Clear cart
      clearCart()

      toast.success('Opening WhatsApp with your order details...')

      // Open WhatsApp
      window.open(whatsappUrl, '_blank')

      // Redirect home
      setTimeout(() => {
        navigate('/', {
          state: {
            successMessage:
              'Order details forwarded to WhatsApp. We will confirm with you shortly. JazakAllah Khair.',
          },
        })
      }, 1500)
    } catch (err) {
      console.error('WhatsApp order error:', err)
      toast.error('Could not complete order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  const inputClass = (field) =>
    `w-full glass-input border ${
      errors[field] ? 'border-red-500' : 'border-white/10'
    } rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors`

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto w-full">
        {/* Page heading */}
        <div className="mb-5 sm:mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FFD700] flex items-center gap-2">
            <CreditCard size={24} />
            Billing &amp; Delivery
          </h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Fill in your delivery details below to proceed with your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* ── LEFT: Billing Form ─────────────────────────────────────── */}
          <section className="glass-panel rounded-xl p-4 sm:p-5 space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Your Details
            </h2>

            {/* Full Name */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Full Name <span className="text-[#FFD700]">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Abdullah Khan"
                className={inputClass('fullName')}
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Mobile Number <span className="text-[#FFD700]">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={inputClass('mobile')}
              />
              {errors.mobile && (
                <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Full Address <span className="text-[#FFD700]">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House / Flat no., Street, Area, City"
                rows={2}
                className={`${inputClass('address')} resize-none`}
              />
              {errors.address && (
                <p className="text-red-400 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Pincode & Landmark in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Pincode <span className="text-[#FFD700]">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className={inputClass('pincode')}
                />
                {errors.pincode && (
                  <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Landmark (optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Masjid"
                  className={inputClass('landmark')}
                />
              </div>
            </div>
          </section>

          {/* ── RIGHT: Order Summary ────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="glass-panel rounded-xl p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-3">
                Order Summary
              </h2>

              {items.length === 0 ? (
                <p className="text-gray-500 text-xs">Your cart is empty.</p>
              ) : (
                <ul className="divide-y divide-white/10 space-y-0">
                  {items.map((item, idx) => (
                    <li
                      key={`${item.id}-${item.size}-${idx}`}
                      className="py-2.5 flex justify-between items-start gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-xs sm:text-sm leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          Size: {item.size} &nbsp;&middot;&nbsp; Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-[#FFD700] font-semibold text-xs sm:text-sm whitespace-nowrap">
                        Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Totals */}
              <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Charge</span>
                  <span>
                    {Number(deliveryCharge) === 0 ? (
                      <span className="text-emerald-400 font-medium">FREE</span>
                    ) : (
                      `Rs. ${Number(deliveryCharge).toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm sm:text-base pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <div className="text-right">
                    <span className="text-[#FFD700]">
                      Rs. {grandTotal.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-gray-500 italic font-normal mt-0.5">
                      delivery price may differ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Payment Section ─────────────────────────────────────── */}
            <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-white">Payment &amp; Ordering</h2>

              {orderPlaced ? (
                <div className="flex items-center gap-2 justify-center py-3 text-emerald-400 font-semibold text-sm">
                  <CheckCircle size={18} />
                  Order placed. Redirecting...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Order with WhatsApp Button */}
                  <button
                    type="button"
                    onClick={handleOrderWithWhatsApp}
                    disabled={placing || items.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    {placing
                      ? 'Forwarding order details...'
                      : `Order with WhatsApp - Rs. ${grandTotal.toLocaleString('en-IN')}`}
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-gray-500 text-[11px] uppercase tracking-wider">or pay online</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  {/* Pay Online — Coming Soon */}
                  <div className="relative">
                    <button
                      type="button"
                      disabled
                      className="w-full bg-[#1a1a1a] border border-white/10 text-gray-500 font-bold py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed text-sm"
                    >
                      <CreditCard size={18} />
                      Pay Online
                    </button>
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#111111] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="glass-card border border-white/10 rounded-lg p-2.5">
                <p className="text-gray-400 text-xs leading-relaxed">
                  <span className="text-[#FFD700] font-medium">WhatsApp Ordering:</span>{' '}
                  Clicking "Order with WhatsApp" opens WhatsApp with your complete itemized bill and delivery address pre-filled for immediate confirmation.
                </p>
              </div>

              <p className="text-gray-500 text-[11px] text-center">
                By placing your order, you agree to our terms. JazakAllah Khair
                for choosing S2 Teespoint.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
