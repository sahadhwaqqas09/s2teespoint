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
    <div className="min-h-screen flex flex-col text-[#261710] bg-[#F7F3EC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-1.5 text-[#784E38] text-xs uppercase tracking-widest glass-badge px-3.5 py-1 mb-3 border border-[#D5C2AE] bg-[#EFE7DC]">
            <Grid3X3 size={13} />
            <span>Islamic T-Shirt Collection</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#261710] tracking-tight mb-2 sm:mb-3">
            Browse by <span className="text-[#784E38]">Category</span>
          </h1>
          <p className="text-[#5C4537] text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Find the perfect t-shirt for every member of your family. Browse through our handpicked
            categories, each filled with meaningful designs crafted with love and devotion.
          </p>
          <div className="w-12 h-0.5 bg-[#8C5E43] mx-auto mt-4" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 sm:h-64 glass-card animate-pulse p-3 sm:p-5 flex flex-col justify-end bg-[#FAF6F0] border border-[#E8DED1]"
              >
                <div className="h-4 sm:h-5 bg-[#DECFC0] w-2/3 mb-2" />
                <div className="h-3 sm:h-3.5 bg-[#E8DED1] w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="bg-[#FAF6F0] border border-[#E8DED1] p-6 sm:p-10 text-center max-w-md mx-auto shadow-sm">
            <Grid3X3 size={28} className="text-[#784E38] mx-auto mb-3" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#261710] mb-2">
              No categories available yet
            </h2>
            <p className="text-[#6F584A] text-xs sm:text-sm leading-relaxed mb-6">
              Our admin has not published categories to the shop yet. New collections will appear here once added from the admin dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                  'Assalamu Alaikum S2 Teespoint, I am browsing your collection catalogue and would like to enquire about available designs.'
                )}`}
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

        {/* Category Tiles Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalogue/${category.id || category.slug}`}
                className="group relative flex flex-col bg-[#FFFFFF] border border-[#E8DED1] hover:border-[#8C5E43] shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Tile Image */}
                <div className="relative h-36 sm:h-52 w-full overflow-hidden bg-[#F0E8DE]">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF6F0] to-[#EFE7DC] text-[#8A7465]">
                      <Layers size={32} className="text-[#8C5E43]/60 mb-1" />
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6F584A] font-medium">
                        {category.name}
                      </span>
                    </div>
                  )}

                  {/* Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-[#FAF6F0]/90 border border-[#D5C2AE] px-2 py-0.5 shadow-sm">
                    <span className="text-[9px] sm:text-[10px] font-semibold text-[#3D261C] uppercase tracking-wider">
                      {category.item_count || 'View'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between bg-[#FFFFFF]">
                  <div>
                    <h2 className="text-sm sm:text-xl font-bold text-[#261710] group-hover:text-[#784E38] transition-colors mb-0.5 sm:mb-1 truncate font-serif">
                      {category.name}
                    </h2>
                    <p className="hidden sm:block text-[#6F584A] text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {category.description || 'Explore our custom printed pieces made with intention and modest care.'}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2.5 sm:mt-4 sm:pt-3 border-t border-[#E8DED1] flex items-center justify-between text-[11px] sm:text-sm font-semibold text-[#784E38]">
                    <span>Enter Collection</span>
                    <ArrowRight size={14} className="text-[#784E38] group-hover:translate-x-1 transition-transform duration-200" />
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
