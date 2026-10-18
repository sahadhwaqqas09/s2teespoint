import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Navbar() {
  const settings = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCartStore((s) => s.getCount());
  const location = useLocation();
  const navigate = useNavigate();
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    'Assalamu Alaikum S2 Teespoint, I am contacting you from the website and would like to enquire about your custom Islamic t-shirts.'
  )}`;

  // Sticky scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    setCurrentHash(location.hash);
  }, [location]);

  const navLinks = [
    { type: 'route', to: '/', label: 'HOME' },
    { type: 'route', to: '/catalogue', label: 'CATALOGUE' },
    { type: 'hash', to: '#story', label: 'OUR STORY' },
    { type: 'hash', to: '#craft', label: 'THE CRAFT' },
    { type: 'hash', to: '#contact', label: 'CONTACT' },
  ];

  const handleNavClick = (link, e) => {
    if (link.type === 'hash') {
      e.preventDefault();
      const targetId = link.to.replace('#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', link.to);
          setCurrentHash(link.to);
        }
      } else {
        navigate(`/${link.to}`);
      }
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
  };

  const isLinkActive = (link) => {
    if (link.type === 'hash') {
      return location.pathname === '/' && currentHash === link.to;
    }
    if (link.to === '/') {
      return location.pathname === '/' && (!currentHash || currentHash === '');
    }
    return location.pathname.startsWith(link.to);
  };

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(12, 12, 12, 0.97)'
          : 'rgba(12, 12, 12, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled
          ? '1px solid rgba(255, 215, 0, 0.2)'
          : '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: scrolled
          ? '0 4px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,215,0,0.08)'
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)] group-hover:scale-105 transition-transform">
            <span className="text-[#111111] font-display font-black text-lg leading-none">S2</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-display font-bold text-sm tracking-wider group-hover:text-[#FFD700] transition-colors">
              Teespoint
            </span>
            <span className="text-[#FFD700] text-[9px] font-semibold tracking-[0.2em] uppercase">
              Islamic Wear
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <a
                key={link.label}
                href={link.type === 'hash' ? `/${link.to}` : link.to}
                onClick={(e) => handleNavClick(link, e)}
                className={`relative py-1 text-xs font-semibold tracking-[0.18em] uppercase transition-colors ${
                  active
                    ? 'text-white font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {active && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right side: WHATSAPP Pill, ADMIN Pill, Cart, Mobile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* WhatsApp Pill */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-emerald-500/60 bg-[#062419]/80 hover:bg-[#073323] hover:border-emerald-400 text-emerald-400 text-xs font-bold tracking-wider transition-all duration-200 shadow-sm group"
            aria-label="WhatsApp"
          >
            <svg
              className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>WHATSAPP</span>
          </a>

          {/* Admin Pill */}
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-purple-400/60 bg-[#25103a]/80 hover:bg-[#341652] hover:border-purple-300 text-white text-xs font-bold tracking-wider transition-all duration-200 shadow-sm group"
            aria-label="Admin Portal"
          >
            <svg
              className="w-3.5 h-3.5 fill-purple-300 transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
            <span>ADMIN</span>
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2 rounded-xl glass-card text-gray-200 hover:text-[#FFD700] hover:border-[#FFD700]/50 transition-all shadow-sm"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={19} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FFD700] text-[#111111] text-[11px] font-black min-w-5 h-5 px-1 rounded-md flex items-center justify-center shadow-md">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl glass-card text-gray-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-5 py-5 flex flex-col gap-3 shadow-2xl"
          style={{
            background: 'rgba(12, 12, 12, 0.99)',
            backdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 215, 0, 0.15)',
          }}
        >
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <a
                key={link.label}
                href={link.type === 'hash' ? `/${link.to}` : link.to}
                onClick={(e) => handleNavClick(link, e)}
                className={`text-xs font-semibold tracking-[0.18em] uppercase py-2 transition-colors flex items-center justify-between ${
                  active ? 'text-[#FFD700] font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />}
              </a>
            );
          })}

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-emerald-500/60 bg-[#062419]/90 text-emerald-400 text-xs font-bold tracking-wider"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>WHATSAPP</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
