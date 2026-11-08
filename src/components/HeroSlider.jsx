import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, MessageCircle } from 'lucide-react';
import { getBanners } from '../lib/banners';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const settings = useSiteSettings();
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    async function loadSlides() {
      setLoading(true);
      const data = await getBanners();
      const activeOnly = data.filter((s) => s.active !== false);
      setSlides(activeOnly.length > 0 ? activeOnly : data);
      setLoading(false);
    }
    loadSlides();

    const handleUpdate = () => loadSlides();
    window.addEventListener('s2_banners_updated', handleUpdate);
    return () => window.removeEventListener('s2_banners_updated', handleUpdate);
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    return (
      <div className="w-full h-[320px] sm:h-[460px] md:h-[520px] bg-[#FAF6F0] animate-pulse border-b border-[#E8DED1] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#784E38] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  // Resolve target link action
  const isWhatsAppLink = currentSlide.link?.includes('wa.me') || currentSlide.link === '#contact';
  const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    'Assalamu Alaikum S2 Teespoint, I am inquiring about the collection featured on your homepage banner.'
  )}`;
  const destination = isWhatsAppLink && !currentSlide.link?.includes('http') ? whatsappUrl : currentSlide.link || '/catalogue';

  return (
    <section
      aria-label="Hero Banner Slider"
      className="relative w-full overflow-hidden bg-[#241711] select-none border-b border-[#DECFC0]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Aspect Ratio Container */}
      <div className="relative w-full h-[340px] sm:h-[460px] md:h-[540px] lg:h-[600px]">
        {/* Slides */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image */}
              <img
                src={slide.image_url}
                alt={slide.title || `S2 Teespoint Banner ${idx + 1}`}
                className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 ease-out"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />

              {/* Tint Overlays for warm readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F120B]/90 via-[#1F120B]/40 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F120B]/80 via-transparent to-transparent hidden sm:block" />

              {/* Slide Content Caption */}
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 flex flex-col justify-end sm:justify-center px-5 sm:px-12 md:px-16 pb-12 sm:pb-0 max-w-3xl z-20">
                  <div className="space-y-2.5 sm:space-y-3.5">
                    {/* Brand Pill */}
                    <span className="inline-block px-3 py-1 bg-[#F7F3EC]/90 text-[#3D261C] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] font-display">
                      S2 Teespoint Collection
                    </span>

                    {/* Headline */}
                    {slide.title && (
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#F7F3EC] leading-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                    )}

                    {/* Subtitle */}
                    {slide.subtitle && (
                      <p className="text-xs sm:text-base text-[#EFE7DC] max-w-xl leading-relaxed drop-shadow line-clamp-3">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Button */}
                    <div className="pt-2">
                      {destination.startsWith('http') ? (
                        <a
                          href={destination}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-[#F7F3EC] text-[#261710] font-bold text-xs sm:text-sm px-6 py-2.5 sm:py-3 hover:bg-[#FFFFFF] transition-all duration-200 shadow-md active:scale-95"
                        >
                          {isWhatsAppLink ? <MessageCircle size={16} className="text-[#784E38]" /> : null}
                          <span>{slide.button_text || 'Explore Collection'}</span>
                          <ArrowRight size={15} />
                        </a>
                      ) : (
                        <Link
                          to={destination}
                          className="inline-flex items-center gap-2 bg-[#F7F3EC] text-[#261710] font-bold text-xs sm:text-sm px-6 py-2.5 sm:py-3 hover:bg-[#FFFFFF] transition-all duration-200 shadow-md active:scale-95"
                        >
                          <span>{slide.button_text || 'Explore Collection'}</span>
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Previous Arrow Button */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-[#261710]/70 hover:bg-[#261710] border border-[#DECFC0]/40 text-[#F7F3EC] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:scale-105"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next Arrow Button */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-[#261710]/70 hover:bg-[#261710] border border-[#DECFC0]/40 text-[#F7F3EC] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:scale-105"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Navigation Indicator Dots / Bars */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-8 bg-[#F7F3EC] shadow-sm'
                      : 'w-2.5 bg-[#F7F3EC]/50 hover:bg-[#F7F3EC]/80'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
