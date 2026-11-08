import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSlider from '../components/HeroSlider'
import { Link } from 'react-router-dom'
import { getCategories } from '../lib/data'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { ShoppingBag, Heart, CheckCircle, Truck, MessageCircle, Layers } from 'lucide-react'

export default function HomePage() {
  const settings = useSiteSettings()
  const customDesignWhatsAppLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    'Assalamu Alaikum S2 Teespoint, I have a custom design in mind and would like to discuss creating a personalized t-shirt.'
  )}`
  const collectionsWhatsAppLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    'Assalamu Alaikum S2 Teespoint, I would like to enquire about new collections and available designs.'
  )}`
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomeCategories() {
      try {
        const data = await getCategories()
        setCategories(data || [])
      } catch {
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchHomeCategories()

    // Smooth scroll if URL has hash (e.g. #story, #craft, #contact)
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }, [])

  return (
    <div className="min-h-screen text-[#261710] font-sans flex flex-col relative overflow-x-hidden bg-[#F7F3EC]">
      <Navbar />

      {/* ─────────────────────────────────────────
          SECTION 1 — HERO IMAGE SLIDER (Managed from Admin)
      ───────────────────────────────────────── */}
      <HeroSlider />

      {/* ─────────────────────────────────────────
          SECTION 2 — OUR STORY
      ───────────────────────────────────────── */}
      <section id="story" className="py-12 sm:py-16 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-3xl mx-auto">

          {/* Section label */}
          <p className="text-[#784E38] text-xs uppercase tracking-widest font-semibold mb-2">Our Story</p>

          {/* Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261710] mb-2 leading-snug">
            Inspired by <em className="text-[#784E38] not-italic font-serif">Faith</em>
          </h2>

          {/* Warm brown rule */}
          <div className="w-12 h-0.5 bg-[#8C5E43] mb-7" />

          {/* Body copy */}
          <div className="space-y-5 text-[#4A3528] text-sm sm:text-base leading-relaxed">
            <p>
              S2 Teespoint began with a simple idea: to bring Islamic values and meaningful designs
              into everyday fashion. We believe a T-shirt is more than just something you wear; it
              is a reflection of your identity, your beliefs, and the values you carry in your heart.
            </p>
            <p>
              From subtle reminders of our deen to designs that proudly reflect our Islamic heritage,
              S2 Teespoint is all about wearing something that means more. Because fashion isn't just
              about how you look — it's also about what you stand for.
            </p>
          </div>

          {/* Closing line */}
          <p className="mt-8 text-[#261710] font-semibold text-sm sm:text-base tracking-wide border-l-2 border-[#8C5E43] pl-4">
            S2 Teespoint — Where Faith Meets Everyday Style.
          </p>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 3 — CATEGORIES PREVIEW
      ───────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-9">
            <span className="text-[#784E38] text-xs uppercase tracking-widest font-semibold">Collections</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#261710] mt-1">Shop by Category</h2>
            <div className="mt-2.5 mx-auto w-16 h-0.5 bg-[#8C5E43]" />
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 sm:h-56 glass-card animate-pulse bg-[#FAF6F0]" />
              ))}
            </div>
          )}

          {/* Categories Grid */}
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/catalogue/${category.id || category.slug}`}
                  className="group relative block bg-[#FFFFFF] border border-[#E8DED1] hover:border-[#8C5E43] transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="h-32 sm:h-48 overflow-hidden bg-[#F0E8DE]">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF6F0] to-[#EFE7DC] text-[#8A7465]">
                        <Layers size={30} className="text-[#8C5E43]/60 mb-1" />
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6F584A] font-medium">
                          {category.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-5 text-center bg-[#FFFFFF]">
                    <h3 className="text-[#261710] font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 group-hover:text-[#784E38] transition-colors truncate">
                      {category.name}
                    </h3>
                    <p className="hidden sm:block text-[#6F584A] text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {category.description || 'Explore this custom collection crafted with meaning and intention.'}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 sm:mt-3 text-[#784E38] text-[10px] sm:text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* If admin hasn't added categories yet */}
          {!loading && categories.length === 0 && (
            <div className="glass-panel p-6 sm:p-8 text-center max-w-lg mx-auto border border-[#E8DED1] bg-[#FAF6F0]">
              <ShoppingBag size={28} className="text-[#784E38] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#261710] mb-2">New Collections Coming Soon</h3>
              <p className="text-[#6F584A] text-xs sm:text-sm leading-relaxed mb-5">
                Our store admin will be adding new collections and categories shortly. In the meantime, you can message us directly on WhatsApp for custom requests.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={collectionsWhatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#3D261C] text-[#F7F3EC] font-semibold text-xs sm:text-sm px-5 py-2.5 hover:bg-[#543729] transition-colors shadow-sm"
                >
                  <MessageCircle size={16} />
                  Message on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 4 — WHATSAPP CTA / CONTACT
      ───────────────────────────────────────── */}
      <section id="contact" className="px-4 sm:px-6 my-8 sm:my-12 scroll-mt-20">
        <div className="max-w-4xl mx-auto bg-[#FAF6F0] p-6 sm:p-10 text-center relative overflow-hidden border border-[#DECFC0] shadow-sm">
          {/* Subtle Warm Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#E5D2BE]/40 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <MessageCircle size={32} className="text-[#784E38] mx-auto mb-3" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261710] mb-2">
              Have a custom design in mind?
            </h2>
            <p className="text-[#5C4537] text-xs sm:text-sm leading-relaxed mb-6 max-w-xl mx-auto">
              Reach out on WhatsApp and we will bring your idea to life. From personalised text to
              your own design, we are here to help.
            </p>
            <a
              href={customDesignWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#3D261C] text-[#F7F3EC] font-bold text-sm sm:text-base px-7 py-3 hover:bg-[#543729] transition-all duration-300 shadow-md"
            >
              <MessageCircle size={18} />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 5 — THE CRAFT / VALUES STRIP
      ───────────────────────────────────────── */}
      <section id="craft" className="bg-[#FAF6F0] border-y border-[#E5DAD0] py-7 sm:py-9 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {/* Pillar 1 */}
          <div className="flex flex-col items-center gap-2 p-2">
            <CheckCircle size={22} className="text-[#784E38]" />
            <h3 className="text-[#261710] font-semibold text-sm sm:text-base">Free-size Options</h3>
            <p className="text-[#6F584A] text-xs leading-relaxed">
              Comfortable fits for everyone, because faith has no size.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="flex flex-col items-center gap-2 p-2 sm:border-x sm:border-[#DECFC0]">
            <Truck size={22} className="text-[#784E38]" />
            <h3 className="text-[#261710] font-semibold text-sm sm:text-base">Pan India Delivery</h3>
            <p className="text-[#6F584A] text-xs leading-relaxed">
              We deliver your order with care to every corner of the country.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="flex flex-col items-center gap-2 p-2">
            <Heart size={22} className="text-[#784E38]" />
            <h3 className="text-[#261710] font-semibold text-sm sm:text-base">Satisfaction Guaranteed</h3>
            <p className="text-[#6F584A] text-xs leading-relaxed">
              If you are not happy, neither are we. We stand behind every order.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
