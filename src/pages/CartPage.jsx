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
    <div className="min-h-screen text-[#261710] bg-[#F7F3EC] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1.5 text-[#261710]">
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#6F584A]">
            Review your items, calculate delivery to your area, and proceed to billing.
          </p>
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAF6F0] border border-[#DECFC0] p-6 sm:p-10 max-w-md mx-auto shadow-sm">
            <ShoppingBag size={38} className="text-[#784E38] mb-3" />
            <p className="text-xs sm:text-sm text-[#5C4537] max-w-xs mb-6 leading-relaxed">
              Your cart is empty right now. Head over to the shop and find something
              that speaks to your heart.
            </p>
            <Link
              to="/catalogue"
              className="px-6 py-2.5 font-semibold text-xs sm:text-sm bg-[#3D261C] text-[#F7F3EC] hover:bg-[#543729] transition-colors shadow-sm"
            >
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5 sm:gap-7">
            {/* ── Cart Items ── */}
            <section className="flex-1 flex flex-col gap-3.5">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="p-3.5 sm:p-4 bg-[#FFFFFF] border border-[#E8DED1] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-[#DECFC0] shrink-0 bg-[#F0E8DE]"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 border border-[#DECFC0] bg-[#FAF6F0] flex items-center justify-center shrink-0">
                        <ShoppingBag size={20} className="text-[#8C5E43]/60" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-base text-[#261710] leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-[#6F584A]">Size:</span>
                        <span className="text-xs font-semibold px-2 py-0.5 border border-[#D5C2AE] bg-[#EFE7DC] text-[#784E38]">
                          {item.size}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#261710] mt-1.5 sm:hidden">
                        Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="p-1.5 text-[#8A7465] hover:text-red-600 transition-colors sm:hidden"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2.5 sm:pt-0 border-t border-[#E8DED1] sm:border-0">
                    <div className="flex items-center gap-1 bg-[#FAF6F0] border border-[#D5C2AE] p-0.5">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id, item.size)}
                        className="w-8 h-8 flex items-center justify-center text-[#3D261C] hover:bg-[#EFE7DC] active:scale-95 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-xs sm:text-sm font-bold text-[#261710]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id, item.size)}
                        className="w-8 h-8 flex items-center justify-center text-[#3D261C] hover:bg-[#EFE7DC] active:scale-95 transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="hidden sm:block text-sm sm:text-base font-bold text-[#261710] min-w-[90px] text-right">
                      Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="hidden sm:block p-1.5 text-[#8A7465] hover:text-red-600 transition-colors"
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
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#784E38] hover:text-[#261710] font-semibold"
                >
                  <span>&larr;</span>
                  <span>Continue browsing other collections</span>
                </Link>
              </div>
            </section>

            {/* ── Order Summary & Delivery ── */}
            <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">

              {/* Pincode / Delivery Rate Box */}
              <div className="p-4 bg-[#FAF6F0] border border-[#DECFC0] shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={15} className="text-[#784E38]" />
                  <h2 className="font-semibold text-xs uppercase tracking-wider text-[#784E38] font-display">
                    Check Delivery Charge
                  </h2>
                </div>

                <p className="text-[11px] text-[#6F584A] mb-3 leading-relaxed">
                  Enter your delivery pincode to calculate courier charge automatically.
                </p>

                {/* Pincode Input */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    className="w-full px-3 py-2.5 pr-10 text-xs bg-[#FFFFFF] text-[#261710] border border-[#D5C2AE] focus:border-[#784E38] outline-none transition-colors"
                  />
                  {/* Inline status icon */}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 size={15} className="text-[#784E38] animate-spin" />}
                    {!checking && deliveryInfo?.serviceable === true && <CheckCircle2 size={15} className="text-emerald-600" />}
                    {!checking && deliveryInfo?.serviceable === false && <XCircle size={15} className="text-red-600" />}
                  </span>
                </div>

                {pincode.length > 0 && pincode.length < 6 && (
                  <p className="text-[11px] text-[#8A7465] mt-1.5">
                    {6 - pincode.length} more digit{6 - pincode.length !== 1 ? 's' : ''} needed
                  </p>
                )}

                {pincodeError && (
                  <p className="text-xs mt-2 text-red-600">{pincodeError}</p>
                )}

                {/* Result card */}
                {deliveryInfo !== null && !checking && (
                  <div className="mt-3">
                    {deliveryInfo.serviceable ? (
                      <div className="p-3 text-xs bg-[#EAF2EB] border border-[#BCD4BF] space-y-1">
                        <p className="text-[#20522B] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          Delivery available to {pincode} ({deliveryInfo.zone})
                        </p>
                        <p className="text-[#3F4E42]">
                          Estimated delivery: <span className="font-semibold text-[#183920]">{deliveryInfo.days} working days</span>
                        </p>
                        <p className="text-[#3F4E42]">
                          Courier charge:{' '}
                          <span className="font-bold text-[#183920] text-sm">
                            Rs. {deliveryInfo.charge.toLocaleString('en-IN')}
                          </span>
                        </p>
                        <p className="text-[#5A6F5E] text-[10px] italic pt-1">
                          delivery price may differ
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 text-xs bg-[#FDF0ED] border border-[#F3C4BE]">
                        <p className="text-[#8C2E24] flex items-center gap-1.5 font-medium">
                          <XCircle size={13} />
                          Please enter a valid Indian pincode.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="p-4 bg-[#FAF6F0] border border-[#DECFC0] shadow-sm">
                <h2 className="font-semibold text-xs uppercase tracking-wider mb-3 text-[#784E38] font-display">
                  Order Total
                </h2>

                <div className="flex flex-col gap-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#5C4537]">
                    <span>
                      Items ({totalQty} {totalQty === 1 ? 'item' : 'items'})
                    </span>
                    <span className="text-[#261710] font-semibold">
                      Rs. {subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#5C4537]">
                    <span>Delivery Charge</span>
                    <span className="font-semibold">
                      {checking ? (
                        <span className="text-[#8A7465] animate-pulse">Calculating...</span>
                      ) : deliveryInfo?.serviceable ? (
                        <span className="text-[#261710]">Rs. {deliveryCharge.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-[#8A7465] italic">Enter pincode above</span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-[#DECFC0] my-1" />

                  <div className="flex justify-between font-bold text-sm sm:text-base">
                    <span className="text-[#261710]">Grand Total</span>
                    <div className="text-right">
                      <span className="text-[#261710]">
                        Rs. {grandTotal.toLocaleString('en-IN')}
                      </span>
                      {!deliveryInfo?.serviceable && (
                        <p className="text-[10px] font-normal text-[#8A7465]">+ delivery</p>
                      )}
                    </div>
                  </div>

                  {deliveryInfo?.serviceable && (
                    <p className="text-[10px] text-[#8A7465] italic text-right -mt-1">
                      delivery price may differ
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleProceedToBilling}
                  disabled={!canProceed}
                  className={`mt-4 w-full py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
                    canProceed
                      ? 'bg-[#3D261C] text-[#F7F3EC] hover:bg-[#543729] cursor-pointer'
                      : 'bg-[#DECFC0] text-[#8A7465] cursor-not-allowed'
                  }`}
                >
                  <span>Proceed to Billing</span>
                  <ArrowRight size={16} />
                </button>

                {!canProceed && (
                  <p className="text-[11px] mt-2 text-center text-[#8A7465]">
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
