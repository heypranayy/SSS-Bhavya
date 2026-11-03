import { getDb } from '@/lib/db';

export interface SiteSettings {
  mainWebsiteShowPrices: boolean; // default: false (ALWAYS BLOCKED BY DEFAULT)
  customCatalogueShowPrices: boolean; // default: true (SHOWN BY DEFAULT IN CUSTOM CATALOGUES)
  brandName: string;
  whatsapp: string;
  email: string;
  defaultMoq: number;
  updated_at?: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  mainWebsiteShowPrices: false, // ALWAYS BLOCKED BY DEFAULT ON MAIN WEBSITE
  customCatalogueShowPrices: true, // ALWAYS CONTAINED BY DEFAULT IN CUSTOM CATALOGUES
  brandName: 'Bhavya Fashions',
  whatsapp: '919830729210',
  email: 'wholesale@bhavyafashions.com',
  defaultMoq: 6,
};

const SETTINGS_KEY = 'site_settings';

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await getDb()
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(SETTINGS_KEY)
    .first<{ value: string }>();
  return { ...DEFAULT_SETTINGS, ...(row ? (JSON.parse(row.value) as Partial<SiteSettings>) : {}) };
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await getDb()
    .prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .bind(SETTINGS_KEY, JSON.stringify(next), next.updated_at)
    .run();

  return next;
}
