import { supabase } from './supabase';

const SETTINGS_KEY = 's2_site_settings';

export const DEFAULT_SETTINGS = {
  phone: '8056234337',
  whatsapp: '918056234337',
  email: 's2teespoint@gmail.com',
  address: '11/91, Kamarajar Street, Thiruvalluvar Nagar, Ayanavaram, Chennai - 600023',
};

// Clean phone for wa.me link (digits only, prepends 91 if 10-digit Indian number)
export function sanitizeWhatsAppNumber(num) {
  if (!num) return DEFAULT_SETTINGS.whatsapp;
  const cleaned = String(num).replace(/\D/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

export function getLocalSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings) {
  try {
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    // Dispatch storage event so other components / tabs re-render
    window.dispatchEvent(new Event('s2_settings_updated'));
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Fetch settings from Supabase 'site_settings' table or fallback to localStorage.
 */
export async function getSiteSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (!error && data) {
      const merged = {
        phone: data.phone || DEFAULT_SETTINGS.phone,
        whatsapp: sanitizeWhatsAppNumber(data.whatsapp || data.phone || DEFAULT_SETTINGS.whatsapp),
        email: data.email || DEFAULT_SETTINGS.email,
        address: data.address || DEFAULT_SETTINGS.address,
      };
      saveLocalSettings(merged);
      return merged;
    }
  } catch (_) {
    // Supabase query failed or offline
  }

  return getLocalSettings();
}

/**
 * Update settings in Supabase and localStorage.
 */
export async function updateSiteSettings(newSettings) {
  const merged = {
    phone: newSettings.phone || DEFAULT_SETTINGS.phone,
    whatsapp: sanitizeWhatsAppNumber(newSettings.whatsapp || newSettings.phone || DEFAULT_SETTINGS.whatsapp),
    email: newSettings.email || DEFAULT_SETTINGS.email,
    address: newSettings.address || DEFAULT_SETTINGS.address,
  };

  // Always save locally first for instant UI response
  saveLocalSettings(merged);

  try {
    await supabase.from('site_settings').upsert({
      id: 1,
      phone: merged.phone,
      whatsapp: merged.whatsapp,
      email: merged.email,
      address: merged.address,
      updated_at: new Date().toISOString(),
    });
  } catch (_) {
    // If table doesn't exist yet, local storage ensures it still works seamlessly
  }

  return merged;
}
