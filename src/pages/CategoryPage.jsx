import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategoryByIdOrSlug, getProductsByCategory } from '../lib/data'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ShoppingCart, ChevronLeft, ChevronRight, Layers } from 'lucide-react'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const addItem = useCartStore((state) => state.addItem)

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Per-product selections: { [productId]: { size, tshirtType } }
  const [selections, setSelections] = useState({})

  // Active type filter — null means "All"
  const [activeType, setActiveType] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const cat = await getCategoryByIdOrSlug(categoryId)
        setCategory(cat)
        const prods = await getProductsByCategory(cat)
        setProducts(prods || [])
        setActiveType(null)
        setSelections({})
      } catch (err) {
        console.error('Error loading category products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [categoryId])

  // Derive distinct types actually present on the products in this category
  const categoryTypes = useMemo(() => {
    const seen = new Set()
    const types = []
    for (const p of products) {
      const t = (p.tshirt_type || '').trim()
      if (t && !seen.has(t)) {
        seen.add(t)
        types.push(t)
      }
    }
    return types
  }, [products])

  // Products visible under the currently active type tab
  const visibleProducts = useMemo(() => {
    if (!activeType) return products
    return products.filter(
      (p) => (p.tshirt_type || '').toLowerCase() === activeType.toLowerCase()
    )
  }, [products, activeType])

  const handleSizeSelect = (productId, size) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), size },
    }))
  }


  const handleAddToCart = (product) => {
    const sel = selections[product.id] || {}
    const sizes = Array.isArray(product.sizes) ? product.sizes : []

    if (sizes.length > 0 && !sel.size) {
      toast.error('Please choose a size to continue')
      return
    }

    // Type is fixed on the product by admin — pass it through to cart
    const chosenType = product.tshirt_type || ''

    addItem(product, sel.size || 'Free-size', chosenType)
    const label = [chosenType, sel.size].filter(Boolean).join(' · ')
    toast.success(`${product.name}${label ? ` (${label})` : ''} added to your cart`)
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-4 text-gray-400">
          <Link to="/" className="hover:text-[#FFFFFF] transition-colors">Home</Link>
          <ChevronRight size={13} />
          <Link to="/catalogue" className="hover:text-[#FFFFFF] transition-colors">Shop</Link>
          <ChevronRight size={13} />
          <span className="text-[#FFFFFF] font-medium">
            {loading ? 'Loading...' : category?.name ?? 'Category'}
          </span>
        </nav>

        {/* Back Link */}
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium mb-5 text-gray-300 hover:text-[#FFFFFF] transition-colors"
        >
          <ChevronLeft size={15} />
          Back to all categories
        </Link>

        {/* Category Header */}
        {!loading && category && (
          <div className="mb-5 border-b border-white/10 pb-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
              {category.name}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm max-w-2xl">
              Browse our curated collection of modest, premium custom prints crafted with pure intention.
            </p>
          </div>
        )}

        {/* ── T-Shirt Type Menu ──
            Rendered only when the category has types defined by admin.
            "All" resets the filter; each type filters the product grid below.
        */}
        {!loading && category && categoryTypes.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mb-2 font-medium">
              Style
            </p>
            <div className="flex flex-wrap gap-2">
              {/* All button */}
              <button
                type="button"
                onClick={() => setActiveType(null)}
                className="transition-all duration-150 text-xs sm:text-sm font-semibold px-4 py-1.5 border"
                style={{
                  borderRadius: '0.25rem',
                  backgroundColor: activeType === null ? '#FFFFFF' : 'transparent',
                  color: activeType === null ? '#111111' : '#aaaaaa',
                  borderColor: activeType === null ? '#FFFFFF' : '#333333',
                }}
              >
                All
              </button>

              {categoryTypes.map((type) => {
                const isActive = activeType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(isActive ? null : type)}
                    className="transition-all duration-150 text-xs sm:text-sm font-semibold px-4 py-1.5 border"
                    style={{
                      borderRadius: '0.25rem',
                      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                      color: isActive ? '#111111' : '#aaaaaa',
                      borderColor: isActive ? '#FFFFFF' : '#333333',
                    }}
                  >
                    {type}
                  </button>
                )
              })}
            </div>

            {/* Show count of filtered results */}
            {activeType && (
              <p className="text-[11px] text-gray-500 mt-2">
                Showing {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''} for{' '}
                <span className="text-[#FFFFFF] font-medium">{activeType}</span>
                <button
                  type="button"
                  onClick={() => setActiveType(null)}
                  className="ml-2 text-gray-500 hover:text-white underline underline-offset-2 text-[11px]"
                >
                  Clear filter
                </button>
              </p>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded overflow-hidden animate-pulse bg-[#111111] border border-[#1e1e1e]">
                <div className="h-40 sm:h-56 w-full bg-white/5" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3.5 sm:h-4 rounded bg-white/5 w-3/4" />
                  <div className="h-3 sm:h-3.5 rounded bg-white/5 w-1/3" />
                  <div className="h-6 sm:h-7 rounded bg-white/5 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Not Found */}
        {!loading && !category && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#111111] border border-[#2a2a2a] rounded px-4 max-w-md mx-auto">
            <h2 className="font-serif text-lg font-semibold mb-2 text-white">Category Not Found</h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">
              This category does not exist or has been removed. Browse all active categories in our shop.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#FFFFFF] text-[#111111] hover:bg-[#e6c200] transition-colors"
              style={{ borderRadius: '0.25rem' }}
            >
              <ChevronLeft size={15} /> View Categories
            </Link>
          </div>
        )}

        {/* Empty state — no products at all */}
        {!loading && category && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#111111] border border-[#2a2a2a] rounded px-4 max-w-md mx-auto">
            <ShoppingCart size={30} className="text-[#FFFFFF] mx-auto mb-3" />
            <h2 className="font-serif text-lg font-semibold mb-2 text-white">No products in this section yet</h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">
              Our team is actively printing new designs for this collection. Check back shortly or browse other categories.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#FFFFFF] text-[#111111] hover:bg-[#e6c200] transition-colors"
              style={{ borderRadius: '0.25rem' }}
            >
              <ChevronLeft size={15} /> Explore Other Categories
            </Link>
          </div>
        )}

        {/* Empty state — products exist but none match the selected type */}
        {!loading && category && products.length > 0 && visibleProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-[#111111] border border-[#2a2a2a] rounded px-4 max-w-md mx-auto">
            <Layers size={28} className="text-gray-600 mx-auto mb-3" />
            <h2 className="text-base font-semibold mb-1 text-white">
              No products for &ldquo;{activeType}&rdquo; yet
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-4 leading-relaxed">
              We haven't added any {activeType} designs to this category yet. Browse all products or pick another style.
            </p>
            <button
              type="button"
              onClick={() => setActiveType(null)}
              className="text-xs sm:text-sm font-semibold px-5 py-2 bg-[#FFFFFF] text-[#111111] hover:bg-[#e6c200] transition-colors"
              style={{ borderRadius: '0.25rem' }}
            >
              Show All Products
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && visibleProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {visibleProducts.map((product) => {
              const sel = selections[product.id] || {}
              const sizes = Array.isArray(product.sizes) ? product.sizes : []

              // Per-product type chips: shown only when a product has its own tshirt_type
              // AND the category has types — lets user see/confirm the type on each card
              const productType = product.tshirt_type || ''

              return (
                <div
                  key={product.id}
                  className="flex flex-col bg-[#111111] border border-[#1e1e1e] overflow-hidden transition-all duration-200 hover:border-[#FFFFFF]/30"
                  style={{ borderRadius: '0.375rem' }}
                >
                  {/* Product Image */}
                  <div className="relative w-full h-36 sm:h-60 overflow-hidden bg-[#141414]">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-600">
                        <ShoppingCart size={28} className="text-gray-700" />
                        <span className="text-[10px] sm:text-xs text-gray-600">Custom Print</span>
                      </div>
                    )}

                    {/* Price tag — solid, no glass */}
                    <div
                      className="absolute top-2 right-2 bg-[#0a0a0a] border border-[#FFFFFF]/40 px-2 py-0.5"
                      style={{ borderRadius: '0.2rem' }}
                    >
                      <span className="text-[10px] sm:text-xs font-bold text-[#FFFFFF]">
                        Rs.&nbsp;{Number(product.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* T-shirt type badge on card (shown when product has a type set) */}
                    {productType && (
                      <div
                        className="absolute top-2 left-2 bg-[#0a0a0a] border border-white/10 px-2 py-0.5"
                        style={{ borderRadius: '0.2rem' }}
                      >
                        <span className="text-[9px] sm:text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                          {productType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col flex-1 p-2.5 sm:p-4 gap-2 sm:gap-3 justify-between">
                    <div>
                      <h3 className="text-xs sm:text-base font-semibold text-white leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="hidden sm:block text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Size Selector */}
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 mb-1">
                        Size:
                      </p>
                      {sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sizes.map((size) => {
                            const isSelected = sel.size === size
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSizeSelect(product.id, size)}
                                className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold border transition-all duration-150"
                                style={{
                                  borderRadius: '0.2rem',
                                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                                  color: isSelected ? '#111111' : '#aaaaaa',
                                  borderColor: isSelected ? '#FFFFFF' : '#333333',
                                  fontWeight: isSelected ? '700' : '600',
                                }}
                              >
                                {size}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-gray-500">Free-size</p>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 active:scale-95"
                      style={{
                        borderRadius: '0.25rem',
                        backgroundColor:
                          sel.size || sizes.length === 0 ? '#FFFFFF' : '#1a1a1a',
                        color:
                          sel.size || sizes.length === 0 ? '#111111' : '#666666',
                        border: `1px solid ${
                          sel.size || sizes.length === 0 ? '#FFFFFF' : '#2a2a2a'
                        }`,
                      }}
                    >
                      <ShoppingCart size={13} className="shrink-0" />
                      <span className="truncate">
                        {sel.size
                          ? `Add to Cart (${sel.size})`
                          : sizes.length > 0
                          ? 'Pick a size first'
                          : 'Add to Cart'}
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
