import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../lib/data';
import { useSiteSettings } from '../hooks/useSiteSettings';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Grid3X3, Layers, MessageCircle } from 'lucide-react';

export default function CataloguePage() {
  const settings = useSiteSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center gap-1.5 text-[#FFD700] text-xs uppercase tracking-widest glass-badge px-3 py-1 rounded-md mb-3">
            <Grid3X3 size={13} />
            <span>Islamic T-Shirt Collection</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">
            Browse by <span className="text-[#FFD700]">Category</span>
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Find the perfect t-shirt for every member of your family. Browse through our handpicked
            categories, each filled with meaningful designs crafted with love and devotion.
          </p>
          <div className="w-12 h-0.5 bg-[#FFD700] mx-auto mt-4" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 sm:h-64 rounded-xl glass-card animate-pulse p-3 sm:p-5 flex flex-col justify-end"
              >
                <div className="h-4 sm:h-5 bg-white/5 rounded w-2/3 mb-2" />
                <div className="h-3 sm:h-3.5 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="glass-panel rounded-xl p-6 sm:p-8 text-center max-w-md mx-auto">
            <Grid3X3 size={28} className="text-[#FFD700] mx-auto mb-3 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white mb-2">
              No categories available yet
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-5">
              Our admin has not published categories to the shop yet. New collections will appear here once added from the admin dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                  'Assalamu Alaikum S2 Teespoint, I am browsing your collection catalogue and would like to enquire about available designs.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#FFD700] text-[#111111] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg hover:bg-[#FFB800] transition-colors shadow-md"
              >
                <MessageCircle size={16} />
                Message on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Category Tiles Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalogue/${category.id || category.slug}`}
                className="group relative flex flex-col glass-card glass-card-hover rounded-xl overflow-hidden"
              >
                {/* Tile Image */}
                <div className="relative h-32 sm:h-50 w-full overflow-hidden bg-[#141414]">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#202020] to-[#111111] text-gray-500">
                      <Layers size={32} className="text-[#FFD700]/40 mb-1" />
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
                        {category.name}
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />

                  {/* Badge */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 glass-badge px-2 py-0.5 rounded-md">
                    <span className="text-[9px] sm:text-[10px] font-semibold text-[#FFD700] uppercase tracking-wider">
                      {category.item_count || 'View'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between bg-[#141414]/40 backdrop-blur-sm">
                  <div>
                    <h2 className="text-sm sm:text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors mb-0.5 sm:mb-1 truncate font-serif">
                      {category.name}
                    </h2>
                    <p className="hidden sm:block text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {category.description || 'Explore our custom printed pieces made with intention and modest care.'}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 sm:mt-4 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[11px] sm:text-sm font-semibold text-[#FFD700]">
                    <span>Enter Collection</span>
                    <ArrowRight size={14} className="text-[#FFD700] group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
