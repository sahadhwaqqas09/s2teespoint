import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Mail } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Footer() {
  const settings = useSiteSettings();

  const whatsappFooterMsg = encodeURIComponent(
    'Assalamu Alaikum S2 Teespoint, I am visiting your website and would like to get in touch regarding an enquiry.'
  );

  return (
    <footer className="bg-[#F0E8DE] border-t border-[#DECFC0] mt-12 sm:mt-16 text-[#261710]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 bg-[#3D261C] flex items-center justify-center">
                <span className="text-[#F7F3EC] font-display font-black text-base">S2</span>
              </div>
              <div>
                <p className="text-[#261710] font-display font-bold text-sm sm:text-base leading-tight tracking-wider">S2 Teespoint</p>
                <p className="text-[#784E38] text-[10px] font-semibold uppercase tracking-[0.2em]">Custom Islamic Wear</p>
              </div>
            </div>
            <p className="text-[#5C4537] text-xs sm:text-sm leading-relaxed">
              We craft t-shirts that carry meaning. Every piece we make is designed
              with the spirit of faith in mind, so you can wear your belief with
              quiet pride every single day.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#261710] font-semibold text-xs uppercase tracking-wider mb-3.5 border-b border-[#DECFC0] pb-2 font-display">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#5C4537]">
              <li>
                <Link to="/" className="hover:text-[#261710] transition-colors font-medium">
                  Home Front Page
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-[#261710] transition-colors font-medium">
                  Product Catalogue
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#261710] transition-colors font-medium">
                  Your Cart &amp; Delivery Check
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#261710] transition-colors text-xs text-[#8A7465]">
                  Admin Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="text-[#261710] font-semibold text-xs uppercase tracking-wider mb-3.5 border-b border-[#DECFC0] pb-2 font-display">
              Contact &amp; Location
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-[#5C4537]">
              {/* Shop Location */}
              <div className="flex items-start gap-2.5">
                <MapPin size={17} className="text-[#784E38] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-[#261710] block">Shop Location:</span>
                  <p className="text-[#5C4537]">
                    {settings.address}
                  </p>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#784E38] shrink-0" />
                <div className="leading-tight">
                  <span className="font-semibold text-[#261710]">Contact: </span>
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-[#5C4537] hover:text-[#261710] transition-colors font-medium"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              {settings.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-[#784E38] shrink-0" />
                  <div className="leading-tight">
                    <span className="font-semibold text-[#261710]">Email: </span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-[#5C4537] hover:text-[#261710] transition-colors font-medium"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp Message */}
              <div className="pt-1.5">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${whatsappFooterMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#3D261C] hover:text-[#784E38] font-semibold transition-colors"
                >
                  <MessageCircle size={16} className="text-[#784E38]" />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#DECFC0] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A7465]">
          <p>
            &copy; {new Date().getFullYear()} S2 Teespoint. All rights reserved.
          </p>
          <p className="text-[11px] text-[#8A7465]">
            Custom Islamic Apparel &bull; Crafted with Intention
          </p>
        </div>
      </div>
    </footer>
  );
}
