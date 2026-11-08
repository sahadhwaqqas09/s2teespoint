import { supabase } from './supabase';

const BANNERS_STORAGE_KEY = 's2_hero_banners';

// Default starter slides with modest, aesthetic high-res apparel imagery
export const DEFAULT_SLIDES = [
  {
    id: 'default-slide-1',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    title: 'Custom Islamic Apparel',
    subtitle: 'Modest, human-designed luxury crafted with love for the deen',
    link: '/catalogue',
    button_text: 'Explore Collection',
    active: true,
    order: 0,
  },
  {
    id: 'default-slide-2',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=80',
    title: 'Hoodies & Oversized Wear',
    subtitle: 'Premium cotton comfort tailored with meaningful reminders',
    link: '/catalogue',
    button_text: 'Shop Styles',
    active: true,
    order: 1,
  },
  {
    id: 'default-slide-3',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80',
    title: 'Personalized Custom Prints',
    subtitle: 'Have a special design or arabic calligraphy in mind? We bring your vision to life',
    link: '#contact',
    button_text: 'Message on WhatsApp',
    active: true,
    order: 2,
  },
];

export function getLocalBanners() {
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) return DEFAULT_SLIDES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SLIDES;
  } catch {
    return DEFAULT_SLIDES;
  }
}

export function saveLocalBanners(banners) {
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new Event('s2_banners_updated'));
  } catch (_) {}
}

/**
 * Fetch banners from Supabase table 'banners', fallback to localStorage.
 */
export async function getBanners() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map((b) => ({
          id: b.id,
          image_url: b.image_url,
          title: b.title || '',
          subtitle: b.subtitle || '',
          link: b.link || '/catalogue',
          button_text: b.button_text || 'Explore Collection',
          active: b.is_active !== false,
          order: b.sort_order ?? 0,
        }));
        saveLocalBanners(formatted);
        return formatted;
      }
    }
  } catch (_) {
    // offline or table doesn't exist yet
  }

  return getLocalBanners();
}

/**
 * Save / Add banner to Supabase and localStorage.
 */
export async function addBanner(banner) {
  const current = getLocalBanners();
  const newBanner = {
    ...banner,
    id: banner.id || `banner-${Date.now()}`,
    order: current.length,
    active: true,
  };

  const updated = [...current, newBanner];
  saveLocalBanners(updated);

  try {
    if (supabase) {
      await supabase.from('banners').insert([
        {
          id: newBanner.id.startsWith('banner-') ? undefined : newBanner.id,
          image_url: newBanner.image_url,
          title: newBanner.title || null,
          subtitle: newBanner.subtitle || null,
          link: newBanner.link || null,
          button_text: newBanner.button_text || null,
          is_active: true,
          sort_order: newBanner.order,
        },
      ]);
    }
  } catch (_) {}

  return updated;
}

/**
 * Delete banner by ID.
 */
export async function deleteBanner(id) {
  const current = getLocalBanners();
  const updated = current.filter((b) => b.id !== id);
  saveLocalBanners(updated);

  try {
    if (supabase) {
      await supabase.from('banners').delete().eq('id', id);
    }
  } catch (_) {}

  return updated;
}

/**
 * Update banners order or active state.
 */
export async function updateBannersList(newList) {
  saveLocalBanners(newList);

  try {
    if (supabase) {
      for (let i = 0; i < newList.length; i++) {
        const b = newList[i];
        await supabase
          .from('banners')
          .update({
            sort_order: i,
            is_active: b.active,
          })
          .eq('id', b.id);
      }
    }
  } catch (_) {}

  return newList;
}
