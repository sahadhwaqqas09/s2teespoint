import { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../lib/settings';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, MessageCircle, Save, Settings } from 'lucide-react';

export default function AdminSettings() {
  const [form, setForm] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSiteSettings();
        setForm({
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          address: data.address || '',
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // If phone is updated and whatsapp isn't customized, sync them conveniently
      ...(name === 'phone' && !prev.whatsapp ? { whatsapp: value } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(form);
      toast.success('Contact info updated! WhatsApp links across the site are now live with this number.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const cleanWaNumber = form.whatsapp ? form.whatsapp.replace(/\D/g, '') : '';
  const previewWaNumber = cleanWaNumber.length === 10 ? `91${cleanWaNumber}` : cleanWaNumber;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-white">
      {/* Page Title */}
      <div className="mb-6 border-b border-[#222222] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#FFFFFF] flex items-center gap-2">
            <Settings size={22} />
            Store Contact &amp; Business Info
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Updating the phone number, email, or address here immediately updates the website header, footer, catalogue, and all WhatsApp links.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading settings...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp & Phone Card */}
          <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-[#FFFFFF] flex items-center gap-2 border-b border-[#1f1f1f] pb-2">
              <MessageCircle size={18} />
              WhatsApp &amp; Phone Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  Primary Phone / Call Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 8056234337 or +91 80562 34337"
                    required
                    className="w-full bg-[#181818] border border-[#333333] pl-9 pr-3 py-2 text-sm text-white focus:border-[#FFFFFF] outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Displayed in footer for phone calls.</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                  WhatsApp Number (Orders &amp; Enquiries)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-400">
                    <MessageCircle size={14} />
                  </span>
                  <input
                    type="text"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="e.g. 918056234337"
                    required
                    className="w-full bg-[#181818] border border-[#333333] pl-9 pr-3 py-2 text-sm text-white focus:border-[#FFFFFF] outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  All customer chats and WhatsApp order submissions will be sent to this number.
                </p>
              </div>
            </div>

            {/* Live WhatsApp preview link */}
            {previewWaNumber && (
              <div className="bg-[#161616] border border-[#2a2a2a] p-3 text-xs flex items-center justify-between">
                <span className="text-gray-400">
                  Live link preview: <strong className="text-emerald-400">https://wa.me/{previewWaNumber}</strong>
                </span>
                <a
                  href={`https://wa.me/${previewWaNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FFFFFF] hover:underline"
                >
                  Test Link &rarr;
                </a>
              </div>
            )}
          </div>

          {/* Email & Address Card */}
          <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-[#FFFFFF] flex items-center gap-2 border-b border-[#1f1f1f] pb-2">
              <Mail size={18} />
              Email &amp; Physical Store Address
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Store Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. s2teespoint@gmail.com"
                  required
                  className="w-full bg-[#181818] border border-[#333333] pl-9 pr-3 py-2 text-sm text-white focus:border-[#FFFFFF] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                Store / Shop Address
              </label>
              <div className="relative">
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. 11/91, Kamarajar Street, Thiruvalluvar Nagar, Ayanavaram, Chennai - 600023"
                  required
                  className="w-full bg-[#181818] border border-[#333333] p-3 text-sm text-white focus:border-[#FFFFFF] outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Displayed in the footer under Shop Location.</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#111111] font-bold text-sm px-6 py-2.5 hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save & Update Everywhere'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
