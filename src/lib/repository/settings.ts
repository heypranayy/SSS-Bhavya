import fs from 'fs';
import path from 'path';
import { getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

let inMemorySettings: SiteSettings = { ...DEFAULT_SETTINGS };

function getSettingsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'site-settings.json');
}

function loadPersistedSettings(): Partial<SiteSettings> {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read site-settings.json:', err);
  }
  return {};
}

function savePersistedSettings(settings: SiteSettings): void {
  try {
    const filePath = getSettingsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write site-settings.json:', err);
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const persisted = loadPersistedSettings();
  let current: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...inMemorySettings,
    ...persisted,
  };

  // If Firebase is configured, fetch latest settings from Firestore system metadata
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDoc(doc(db, 'system_metadata', 'site_settings'));
        if (snap.exists()) {
          const remoteData = snap.data() as Partial<SiteSettings>;
          current = {
            ...current,
            ...remoteData,
          };
          inMemorySettings = current;
        }
      }
    } catch (err) {
      console.warn('Firebase site settings fetch fallback:', err);
    }
  }

  return current;
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  inMemorySettings = next;
  savePersistedSettings(next);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, 'system_metadata', 'site_settings'), next, { merge: true });
      }
    } catch (err) {
      console.error('Failed to update site settings in Firebase:', err);
    }
  }

  return next;
}
