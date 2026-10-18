import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Mail } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Footer() {
  const settings = useSiteSettings();

  const whatsappFooterMsg = encodeURIComponent(
    'Assalamu Alaikum S2 Teespoint, I am visiting your website and would like to get in touch regarding an enquiry.'
  );

  return (
    <footer className="glass-nav border-t border-white/10 mt-10 sm:mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-[#FFFFFF] rounded-lg flex items-center justify-center">
                <span className="text-[#111111] font-display font-black text-base">S2</span>
              </div>
              <div>
                <p className="text-white font-display font-bold text-sm sm:text-base leading-tight tracking-wider">S2 Teespoint</p>
                <p className="text-[#FFFFFF] text-[10px] font-semibold uppercase tracking-[0.2em]">Custom Islamic Wear</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              We craft t-shirts that carry meaning. Every piece we make is designed
              with the spirit of faith in mind, so you can wear your belief with
              quiet pride every single day.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 border-b border-[#222222] pb-1.5">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-[#FFFFFF] transition-colors">
                  Home Front Page
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-[#FFFFFF] transition-colors">
                  Product Catalogue
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#FFFFFF] transition-colors">
                  Your Cart &amp; Delivery Check
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#FFFFFF] transition-colors text-xs text-gray-500">
                  Admin Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 border-b border-[#222222] pb-1.5">
              Contact &amp; Location
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-gray-400">
              {/* Shop Location */}
              <div className="flex items-start gap-2.5">
                <MapPin size={17} className="text-[#FFFFFF] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-white block">Shop Location:</span>
                  <p className="text-gray-300">
                    {settings.address}
                  </p>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#FFFFFF] shrink-0" />
                <div className="leading-tight">
                  <span className="font-semibold text-white">Contact: </span>
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-gray-300 hover:text-[#FFFFFF] transition-colors font-medium"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              {settings.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-[#FFFFFF] shrink-0" />
                  <div className="leading-tight">
                    <span className="font-semibold text-white">Email: </span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-gray-300 hover:text-[#FFFFFF] transition-colors font-medium"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp Message */}
              <div className="pt-1">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${whatsappFooterMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} S2 Teespoint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
