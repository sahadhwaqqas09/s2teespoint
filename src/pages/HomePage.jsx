import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { getCategories } from '../lib/data'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { ShoppingBag, Heart, CheckCircle, Truck, MessageCircle, Layers } from 'lucide-react'

// Inline SVG Islamic geometric pattern for Hero background
const IslamicPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <pattern id="islamic-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect x="5" y="5" width="70" height="70" fill="none" stroke="#FFFFFF" strokeWidth="0.6" />
        <line x1="5" y1="5" x2="75" y2="75" stroke="#FFFFFF" strokeWidth="0.4" />
        <line x1="75" y1="5" x2="5" y2="75" stroke="#FFFFFF" strokeWidth="0.4" />
        <polygon points="40,8 72,40 40,72 8,40" fill="none" stroke="#FFFFFF" strokeWidth="0.6" />
        <circle cx="40" cy="40" r="8" fill="none" stroke="#FFFFFF" strokeWidth="0.6" />
        <circle cx="5" cy="5" r="2" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="75" cy="5" r="2" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="5" cy="75" r="2" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="75" cy="75" r="2" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="40" cy="5" r="1.5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="40" cy="75" r="1.5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="5" cy="40" r="1.5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="75" cy="40" r="1.5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-geo)" />
  </svg>
)

export default function HomePage() {
  const settings = useSiteSettings()
  const heroWhatsAppLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    'Assalamu Alaikum S2 Teespoint, I would like to know more about your custom Islamic t-shirts and collections.'
  )}`
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
    <div className="min-h-screen text-white font-sans flex flex-col relative overflow-x-hidden">
      <Navbar />

      {/* ─────────────────────────────────────────
          SECTION 1 — HERO (Glass UI)
      ───────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-12 sm:py-16 text-center">
        <IslamicPattern />

        {/* Ambient Glowing Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] bg-[#FFFFFF]/12 rounded-full blur-[120px] pointer-events-none" />

        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFFFFF] to-transparent" />

        {/* Bismillah in Amiri font */}
        <p
          className="text-[#FFFFFF] text-3xl sm:text-4xl md:text-5xl mb-4 leading-relaxed tracking-wider font-normal font-arabic relative z-10 drop-shadow-[0_2px_10px_rgba(255, 255, 255,0.25)]"
          style={{ fontFamily: "'Amiri', serif", direction: 'rtl' }}
          lang="ar"
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>

        {/* Brand badge */}
        <span className="inline-block glass-badge text-[#FFFFFF] text-[11px] uppercase tracking-[0.25em] font-display font-bold px-3.5 py-1 rounded-md mb-4 relative z-10">
          S2 Teespoint
        </span>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white max-w-4xl mb-4 tracking-tight relative z-10 drop-shadow-md">
          Wear Your Faith,{' '}
          <span className="text-[#FFFFFF] italic font-serif font-normal">Express Your Soul</span>
        </h1>

        {/* Subheadline */}
        <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mb-7 leading-relaxed relative z-10">
          S2 Teespoint brings you custom Islamic t-shirts crafted with care, meaning, and a love for
          the deen. Every piece is made to help you carry your belief close to your heart.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center relative z-10">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#111111] font-semibold text-sm sm:text-base px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-[0_0_25px_rgba(255, 255, 255,0.35)]"
          >
            <ShoppingBag size={18} />
            Browse Collection
          </Link>
          <a
            href={heroWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 glass-badge text-[#FFFFFF] font-semibold text-sm sm:text-base px-6 py-2.5 rounded-lg hover:bg-[#FFFFFF]/20 transition-all duration-300"
          >
            <MessageCircle size={18} />
            Message on WhatsApp
          </a>
        </div>

        {/* Decorative divider */}
        <div className="mt-8 flex items-center justify-center relative z-10">
          <div className="w-12 h-px bg-[#FFFFFF] opacity-40" />
          <div className="w-1.5 h-1.5 bg-[#FFFFFF] mx-2 opacity-60 rotate-45" />
          <div className="w-12 h-px bg-[#FFFFFF] opacity-40" />
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 2 — OUR STORY
      ───────────────────────────────────────── */}
      <section id="story" className="py-10 sm:py-16 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-3xl mx-auto">

          {/* Section label */}
          <p className="text-[#FFFFFF] text-xs uppercase tracking-widest mb-3">Our Story</p>

          {/* Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1 leading-snug">
            Inspired by <em className="text-[#FFFFFF] not-italic font-serif">Faith</em>
          </h2>

          {/* Gold rule */}
          <div className="w-12 h-px bg-[#FFFFFF] mb-7" />

          {/* Body copy — user-provided text */}
          <div className="space-y-5 text-gray-300 text-sm sm:text-base leading-relaxed">
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
          <p className="mt-8 text-[#FFFFFF] font-semibold text-sm sm:text-base tracking-wide border-l-2 border-[#FFFFFF] pl-4">
            S2 Teespoint — Where Faith Meets Everyday Style.
          </p>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 3 — CATEGORIES PREVIEW (Glass UI & 2-Col Mobile)
      ───────────────────────────────────────── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-8">
            <span className="text-[#FFFFFF] text-xs uppercase tracking-widest">Collections</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Shop by Category</h2>
            <div className="mt-2.5 mx-auto w-16 h-0.5 bg-[#FFFFFF]" />
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 sm:h-56 rounded-xl glass-card animate-pulse" />
              ))}
            </div>
          )}

          {/* If admin has added categories */}
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/catalogue/${category.id || category.slug}`}
                  className="group relative block glass-card glass-card-hover rounded-xl overflow-hidden"
                >
                  <div className="h-32 sm:h-48 overflow-hidden bg-[#141414]">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#202020] to-[#111111] text-gray-500">
                        <Layers size={30} className="text-[#FFFFFF]/50 mb-1" />
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
                          {category.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 sm:p-5 text-center bg-[#141414]/50 backdrop-blur-sm">
                    <h3 className="text-[#FFFFFF] font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 group-hover:text-yellow-400 truncate">
                      {category.name}
                    </h3>
                    <p className="hidden sm:block text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {category.description || 'Explore this custom collection crafted with meaning and intention.'}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 sm:mt-3 text-[#FFFFFF] text-[10px] sm:text-xs font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* If admin hasn't added categories yet */}
          {!loading && categories.length === 0 && (
            <div className="glass-panel rounded-xl p-6 sm:p-8 text-center max-w-lg mx-auto">
              <ShoppingBag size={28} className="text-[#FFFFFF] mx-auto mb-3 drop-shadow-[0_0_10px_rgba(255, 255, 255,0.3)]" />
              <h3 className="text-lg font-bold text-white mb-2">New Collections Coming Soon</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-5">
                Our store admin will be adding new collections and categories shortly. In the meantime, you can message us directly on WhatsApp for custom requests.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={collectionsWhatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#FFFFFF] text-[#111111] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors shadow-md"
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
          SECTION 4 — WHATSAPP CTA / CONTACT (Glass UI)
      ───────────────────────────────────────── */}
      <section id="contact" className="px-4 sm:px-6 my-6 sm:my-10 scroll-mt-20">
        <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden border border-[#FFFFFF]/30 shadow-[0_8px_32px_rgba(255, 255, 255,0.08)]">
          {/* Subtle Ambient Glow inside Glass */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFFFFF]/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <MessageCircle size={32} className="text-[#FFFFFF] mx-auto mb-3 drop-shadow-[0_0_15px_rgba(255, 255, 255,0.4)]" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              Have a custom design in mind?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl mx-auto">
              Reach out on WhatsApp and we will bring your idea to life. From personalised text to
              your own design, we are here to help.
            </p>
            <a
              href={customDesignWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#FFFFFF] text-[#111111] font-bold text-sm sm:text-base px-7 py-3 rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(255, 255, 255,0.3)]"
            >
              <MessageCircle size={18} />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 5 — THE CRAFT / VALUES STRIP (Glass UI)
      ───────────────────────────────────────── */}
      <section id="craft" className="glass-card border-x-0 rounded-none py-6 sm:py-8 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          {/* Pillar 1 */}
          <div className="flex flex-col items-center gap-2 p-2">
            <CheckCircle size={22} className="text-[#FFFFFF]" />
            <h3 className="text-white font-semibold text-sm sm:text-base">Free-size Options</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Comfortable fits for everyone, because faith has no size.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="flex flex-col items-center gap-2 p-2 sm:border-x sm:border-white/10">
            <Truck size={22} className="text-[#FFFFFF]" />
            <h3 className="text-white font-semibold text-sm sm:text-base">Pan India Delivery</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              We deliver your order with care to every corner of the country.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="flex flex-col items-center gap-2 p-2">
            <Heart size={22} className="text-[#FFFFFF]" />
            <h3 className="text-white font-semibold text-sm sm:text-base">Satisfaction Guaranteed</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              If you are not happy, neither are we. We stand behind every order.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
