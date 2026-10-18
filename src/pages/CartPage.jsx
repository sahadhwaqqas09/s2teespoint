import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { estimateDelivery } from '../lib/deliveryEstimate'
import { Trash2, Plus, Minus, ShoppingBag, MapPin, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, increaseQuantity, decreaseQuantity, removeItem } = useCartStore()

  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [checking, setChecking] = useState(false)
  const [pincodeError, setPincodeError] = useState('')

  const debounceRef = useRef(null)

  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryCharge = deliveryInfo?.serviceable ? deliveryInfo.charge : 0
  const grandTotal = subtotal + deliveryCharge

  // ── Auto-calculate delivery charge when pincode reaches 6 digits ───────────
  useEffect(() => {
    if (pincode.length < 6) {
      setDeliveryInfo(null)
      setPincodeError('')
      return
    }
    if (pincode.length === 6) {
      clearTimeout(debounceRef.current)
      setChecking(true)
      debounceRef.current = setTimeout(() => {
        const result = estimateDelivery(pincode)
        if (!result.valid) {
          setPincodeError('Please enter a valid 6-digit Indian pincode.')
          setDeliveryInfo(null)
        } else {
          setPincodeError('')
          setDeliveryInfo(result)
        }
        setChecking(false)
      }, 300)
    }
    return () => clearTimeout(debounceRef.current)
  }, [pincode])

  function handlePincodeChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPincode(val)
    if (val.length < 6) {
      setDeliveryInfo(null)
      setPincodeError('')
    }
  }

  function handleProceedToBilling() {
    navigate('/billing', { state: { deliveryCharge, pincode } })
  }

  const canProceed = items.length > 0

  return (
    <div className="min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-3.5 sm:px-6 py-5 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1 text-[#FFD700]">
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Review your items, calculate delivery to your area, and proceed to billing.
          </p>
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-12 text-center glass-panel rounded-xl p-6 sm:p-8 max-w-md mx-auto">
            <ShoppingBag size={38} className="text-[#FFD700] mb-3 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
            <p className="text-xs sm:text-sm text-gray-300 max-w-xs mb-5 leading-relaxed">
              Your cart is empty right now. Head over to the shop and find something
              that speaks to your heart.
            </p>
            <Link
              to="/catalogue"
              className="px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-[#FFD700] text-[#111111] hover:bg-[#FFB800] transition-colors shadow-md"
            >
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* ── Cart Items ── */}
            <section className="flex-1 flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="rounded-xl p-3 sm:p-4 glass-card glass-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg glass-card border border-white/10 flex items-center justify-center shrink-0">
                        <ShoppingBag size={20} className="text-[#FFD700]/50" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-base text-white leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-400">Size:</span>
                        <span className="text-xs glass-badge text-[#FFD700] font-semibold px-2 py-0.5 rounded border border-[#FFD700]/30">
                          {item.size}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#FFD700] mt-1 sm:hidden">
                        Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors sm:hidden"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-white/10 sm:border-0">
                    <div className="flex items-center gap-1 glass-card border border-white/10 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id, item.size)}
                        className="w-8 h-8 flex items-center justify-center rounded text-[#FFD700] hover:bg-white/5 active:scale-95 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-xs sm:text-sm font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id, item.size)}
                        className="w-8 h-8 flex items-center justify-center rounded text-[#FFD700] hover:bg-white/5 active:scale-95 transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="hidden sm:block text-sm sm:text-base font-bold text-[#FFD700] min-w-[90px] text-right">
                      Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="hidden sm:block p-1.5 rounded text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-2 text-center sm:text-left">
                <Link
                  to="/catalogue"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#FFD700] hover:underline"
                >
                  <span>&larr;</span>
                  <span>Continue browsing other collections</span>
                </Link>
              </div>
            </section>

            {/* ── Order Summary & Delivery ── */}
            <aside className="w-full lg:w-80 flex flex-col gap-3.5 shrink-0">

              {/* Pincode / Delivery Rate Box */}
              <div className="rounded-xl p-3.5 sm:p-4 glass-panel">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin size={15} className="text-[#FFD700]" />
                  <h2 className="font-semibold text-xs uppercase tracking-wider text-[#FFD700]">
                    Check Delivery Charge
                  </h2>
                </div>

                <p className="text-[11px] text-gray-400 mb-2.5 leading-relaxed">
                  Enter your delivery pincode to calculate courier charge automatically.
                </p>

                {/* Pincode Input — auto-calculates on 6 digits */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-xs glass-input text-white outline-none border border-white/10 focus:border-[#FFD700]/50 transition-colors"
                  />
                  {/* Inline status icon */}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 size={15} className="text-[#FFD700] animate-spin" />}
                    {!checking && deliveryInfo?.serviceable === true && <CheckCircle2 size={15} className="text-emerald-400" />}
                    {!checking && deliveryInfo?.serviceable === false && <XCircle size={15} className="text-red-400" />}
                  </span>
                </div>

                {pincode.length > 0 && pincode.length < 6 && (
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    {6 - pincode.length} more digit{6 - pincode.length !== 1 ? 's' : ''} needed
                  </p>
                )}

                {pincodeError && (
                  <p className="text-xs mt-2 text-red-400">{pincodeError}</p>
                )}

                {/* Result card */}
                {deliveryInfo !== null && !checking && (
                  <div className="mt-2.5">
                    {deliveryInfo.serviceable ? (
                      <div className="rounded-lg p-3 text-xs bg-emerald-950/40 border border-emerald-800/50 backdrop-blur-sm space-y-1">
                        <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          Delivery available to {pincode} ({deliveryInfo.zone})
                        </p>
                        <p className="text-gray-300">
                          Estimated delivery: <span className="font-medium text-white">{deliveryInfo.days} working days</span>
                        </p>
                        <p className="text-gray-300">
                          Courier charge:{' '}
                          <span className="font-bold text-[#FFD700] text-sm">
                            Rs. {deliveryInfo.charge.toLocaleString('en-IN')}
                          </span>
                        </p>
                        <p className="text-gray-400 text-[10px] italic pt-1">
                          delivery price may differ
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg p-3 text-xs bg-red-950/40 border border-red-800/50 backdrop-blur-sm">
                        <p className="text-red-400 flex items-center gap-1.5">
                          <XCircle size={13} />
                          Please enter a valid Indian pincode.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="rounded-xl p-3.5 sm:p-4 glass-panel">
                <h2 className="font-semibold text-xs uppercase tracking-wider mb-2.5 text-[#FFD700]">
                  Order Total
                </h2>

                <div className="flex flex-col gap-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>
                      Items ({totalQty} {totalQty === 1 ? 'item' : 'items'})
                    </span>
                    <span className="text-white font-medium">
                      Rs. {subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Delivery Charge</span>
                    <span className="font-medium">
                      {checking ? (
                        <span className="text-gray-500 animate-pulse">Calculating...</span>
                      ) : deliveryInfo?.serviceable ? (
                        <span className="text-white">Rs. {deliveryCharge.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-gray-500 italic">Enter pincode above</span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-[#2A2A2A] my-1" />

                  <div className="flex justify-between font-bold text-sm sm:text-base">
                    <span className="text-white">Grand Total</span>
                    <div className="text-right">
                      <span className="text-[#FFD700]">
                        Rs. {grandTotal.toLocaleString('en-IN')}
                      </span>
                      {!deliveryInfo?.serviceable && (
                        <p className="text-[10px] font-normal text-gray-500">+ delivery</p>
                      )}
                    </div>
                  </div>

                  {deliveryInfo?.serviceable && (
                    <p className="text-[10px] text-gray-500 italic text-right -mt-1">
                      delivery price may differ
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleProceedToBilling}
                  disabled={!canProceed}
                  className="mt-4 w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
                  style={{
                    backgroundColor: canProceed ? '#FFD700' : '#2A2A2A',
                    color: canProceed ? '#111111' : '#666',
                    cursor: canProceed ? 'pointer' : 'not-allowed',
                  }}
                >
                  <span>Proceed to Billing</span>
                  <ArrowRight size={16} />
                </button>

                {!canProceed && (
                  <p className="text-[11px] mt-2 text-center text-gray-500">
                    Add items to your cart to continue.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
