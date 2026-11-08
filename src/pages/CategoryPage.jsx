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
      }
      if (t && !types.includes(t)) {
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

    const chosenType = product.tshirt_type || ''

    addItem(product, sel.size || 'Free-size', chosenType)
    const label = [chosenType, sel.size].filter(Boolean).join(' · ')
    toast.success(`${product.name}${label ? ` (${label})` : ''} added to your cart`)
  }

  return (
    <div className="min-h-screen flex flex-col text-[#261710] bg-[#F7F3EC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-4 text-[#6F584A]">
          <Link to="/" className="hover:text-[#261710] transition-colors">Home</Link>
          <ChevronRight size={13} />
          <Link to="/catalogue" className="hover:text-[#261710] transition-colors">Shop</Link>
          <ChevronRight size={13} />
          <span className="text-[#261710] font-semibold">
            {loading ? 'Loading...' : category?.name ?? 'Category'}
          </span>
        </nav>

        {/* Back Link */}
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold mb-6 text-[#5C4537] hover:text-[#261710] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to all categories
        </Link>

        {/* Category Header */}
        {!loading && category && (
          <div className="mb-6 border-b border-[#DECFC0] pb-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#261710] mb-1.5">
              {category.name}
            </h1>
            <p className="text-[#6F584A] text-xs sm:text-sm max-w-2xl leading-relaxed">
              Browse our curated collection of modest, premium custom prints crafted with pure intention.
            </p>
          </div>
        )}

        {/* ── T-Shirt Style/Type Filter ── */}
        {!loading && category && categoryTypes.length > 0 && (
          <div className="mb-7">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#784E38] mb-2 font-semibold font-display">
              Style
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveType(null)}
                className={`transition-all duration-150 text-xs sm:text-sm font-semibold px-4 py-1.5 border ${
                  activeType === null
                    ? 'bg-[#3D261C] text-[#F7F3EC] border-[#3D261C]'
                    : 'bg-[#FFFFFF] text-[#5C4537] border-[#D5C2AE] hover:border-[#8C5E43]'
                }`}
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
                    className={`transition-all duration-150 text-xs sm:text-sm font-semibold px-4 py-1.5 border ${
                      isActive
                        ? 'bg-[#3D261C] text-[#F7F3EC] border-[#3D261C]'
                        : 'bg-[#FFFFFF] text-[#5C4537] border-[#D5C2AE] hover:border-[#8C5E43]'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>

            {/* Filtered count */}
            {activeType && (
              <p className="text-[11px] text-[#6F584A] mt-2">
                Showing {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''} for{' '}
                <span className="text-[#261710] font-bold">{activeType}</span>
                <button
                  type="button"
                  onClick={() => setActiveType(null)}
                  className="ml-2 text-[#784E38] hover:text-[#261710] underline underline-offset-2 text-[11px] font-semibold"
                >
                  Clear filter
                </button>
              </p>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-[#FAF6F0] border border-[#E8DED1]">
                <div className="h-40 sm:h-56 w-full bg-[#EFE7DC]" />
                <div className="p-3 sm:p-4 space-y-2.5">
                  <div className="h-4 bg-[#DECFC0] w-3/4" />
                  <div className="h-3.5 bg-[#DECFC0] w-1/3" />
                  <div className="h-8 bg-[#EFE7DC] w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Not Found */}
        {!loading && !category && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAF6F0] border border-[#DECFC0] p-6 max-w-md mx-auto shadow-sm">
            <h2 className="font-serif text-lg font-semibold mb-2 text-[#261710]">Category Not Found</h2>
            <p className="text-[#6F584A] text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">
              This category does not exist or has been removed. Browse all active categories in our shop.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#3D261C] text-[#F7F3EC] hover:bg-[#543729] transition-colors"
            >
              <ChevronLeft size={15} /> View Categories
            </Link>
          </div>
        )}

        {/* Empty state — no products */}
        {!loading && category && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAF6F0] border border-[#DECFC0] p-6 max-w-md mx-auto shadow-sm">
            <ShoppingCart size={30} className="text-[#784E38] mx-auto mb-3" />
            <h2 className="font-serif text-lg font-semibold mb-2 text-[#261710]">No products in this section yet</h2>
            <p className="text-[#6F584A] text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">
              Our team is actively printing new designs for this collection. Check back shortly or browse other categories.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#3D261C] text-[#F7F3EC] hover:bg-[#543729] transition-colors"
            >
              <ChevronLeft size={15} /> Explore Other Categories
            </Link>
          </div>
        )}

        {/* Empty state — products exist but none match selected type */}
        {!loading && category && products.length > 0 && visibleProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-[#FAF6F0] border border-[#DECFC0] p-6 max-w-md mx-auto shadow-sm">
            <Layers size={28} className="text-[#8C5E43] mx-auto mb-3" />
            <h2 className="text-base font-semibold mb-1 text-[#261710]">
              No products for &ldquo;{activeType}&rdquo; yet
            </h2>
            <p className="text-[#6F584A] text-xs sm:text-sm max-w-sm mb-4 leading-relaxed">
              We haven't added any {activeType} designs to this category yet. Browse all products or pick another style.
            </p>
            <button
              type="button"
              onClick={() => setActiveType(null)}
              className="text-xs sm:text-sm font-semibold px-5 py-2 bg-[#3D261C] text-[#F7F3EC] hover:bg-[#543729] transition-colors"
            >
              Show All Products
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && visibleProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {visibleProducts.map((product) => {
              const sel = selections[product.id] || {}
              const sizes = Array.isArray(product.sizes) ? product.sizes : []
              const productType = product.tshirt_type || ''

              return (
                <div
                  key={product.id}
                  className="flex flex-col bg-[#FFFFFF] border border-[#E8DED1] overflow-hidden transition-all duration-200 hover:border-[#8C5E43] shadow-sm hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-36 sm:h-60 overflow-hidden bg-[#F0E8DE]">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#FAF6F0] to-[#EFE7DC] text-[#8A7465]">
                        <ShoppingCart size={28} className="text-[#8C5E43]/60 mb-1" />
                        <span className="text-[10px] sm:text-xs text-[#6F584A] font-medium">Custom Print</span>
                      </div>
                    )}

                    {/* Price tag */}
                    <div className="absolute top-2.5 right-2.5 bg-[#3D261C] text-[#F7F3EC] px-2.5 py-0.5 shadow-sm">
                      <span className="text-[10px] sm:text-xs font-bold font-sans">
                        Rs.&nbsp;{Number(product.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* T-shirt type badge on card */}
                    {productType && (
                      <div className="absolute top-2.5 left-2.5 bg-[#FAF6F0]/90 border border-[#D5C2AE] px-2 py-0.5 shadow-sm">
                        <span className="text-[9px] sm:text-[11px] text-[#784E38] font-semibold uppercase tracking-wide">
                          {productType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col flex-1 p-3 sm:p-5 gap-2.5 sm:gap-3.5 justify-between bg-[#FFFFFF]">
                    <div>
                      <h3 className="text-xs sm:text-base font-semibold text-[#261710] leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="hidden sm:block text-xs text-[#6F584A] mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Size Selector */}
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#784E38] mb-1.5 uppercase tracking-wide">
                        Size:
                      </p>
                      {sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {sizes.map((size) => {
                            const isSelected = sel.size === size
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSizeSelect(product.id, size)}
                                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold border transition-all duration-150 ${
                                  isSelected
                                    ? 'bg-[#3D261C] text-[#F7F3EC] border-[#3D261C]'
                                    : 'bg-[#FAF6F0] text-[#5C4537] border-[#D5C2AE] hover:border-[#8C5E43]'
                                }`}
                              >
                                {size}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-[#6F584A] font-medium">Free-size</p>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className={`w-full py-2 sm:py-2.5 text-[11px] sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 active:scale-98 ${
                        sel.size || sizes.length === 0
                          ? 'bg-[#3D261C] text-[#F7F3EC] hover:bg-[#543729] shadow-sm'
                          : 'bg-[#EFE7DC] text-[#8A7465] border border-[#DECFC0]'
                      }`}
                    >
                      <ShoppingCart size={14} className="shrink-0" />
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
