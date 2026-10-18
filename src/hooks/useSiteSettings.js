import { useState, useEffect } from 'react';
import { getLocalSettings, getSiteSettings } from '../lib/settings';

export function useSiteSettings() {
  const [settings, setSettings] = useState(getLocalSettings());

  useEffect(() => {
    // 1. Initial fetch from Supabase
    getSiteSettings().then((s) => setSettings(s));

    // 2. Listen to custom event when settings are updated in admin
    const handleUpdate = () => {
      setSettings(getLocalSettings());
    };
    window.addEventListener('s2_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('s2_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return settings;
}
