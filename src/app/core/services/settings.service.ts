import { Injectable, effect, signal } from '@angular/core';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  primaryColor: string;
  inkColor: string;
  bgColor: string;
  instagramUrl: string;
  pinterestUrl: string;
  tiktokUrl: string;
  linkedinUrl: string;
  contactEmail: string;
  atelierAddress: string;
  /** Photos optionnelles de l'atelier sur-mesure, par silhouette. */
  customizerImages: Record<string, string>;
}

const STORAGE_KEY = 'follar.settings.v1';
const API_URL = 'http://localhost:8080/api/settings';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'FOLLAR',
  tagline: 'Vestiaire essentiel, Paris',
  primaryColor: '#d93a2b',
  inkColor: '#111110',
  bgColor: '#f6f4ef',
  instagramUrl: 'https://instagram.com/follar.paris',
  pinterestUrl: 'https://pinterest.com/follarparis',
  tiktokUrl: 'https://tiktok.com/@follar.paris',
  linkedinUrl: 'https://linkedin.com/company/follar',
  contactEmail: 'bonjour@follar.paris',
  atelierAddress: '12 rue de Turenne, Paris 3e',
  customizerImages: {},
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<SiteSettings>(this.restore());

  /**
   * "synced" once the Spring Boot/H2 API acknowledged the settings, "local"
   * when the backend is unavailable and localStorage is the only store.
   */
  readonly storageStatus = signal<'local' | 'synced'>('local');

  private localTouched = false;

  constructor() {
    effect(() => {
      const s = this.settings();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {}
      this.applyToDocument(s);
    });

    void this.loadFromBackend();
  }

  /** Persist a patch in the database (and locally). Resolves to backend success. */
  async update(patch: Partial<SiteSettings>): Promise<boolean> {
    this.localTouched = true;
    this.settings.update((current) => ({ ...current, ...patch }));
    return this.pushToBackend();
  }

  /** Restore defaults and persist them. Resolves to backend success. */
  async reset(): Promise<boolean> {
    this.localTouched = true;
    this.settings.set(this.cloneDefaults());
    return this.pushToBackend();
  }

  /** Force a refresh from the database (used after backend restarts). */
  async refreshFromBackend(): Promise<boolean> {
    return this.loadFromBackend();
  }

  private cloneDefaults(): SiteSettings {
    return { ...DEFAULT_SETTINGS, customizerImages: { ...DEFAULT_SETTINGS.customizerImages } };
  }

  private async loadFromBackend(): Promise<boolean> {
    try {
      const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        this.storageStatus.set('local');
        return false;
      }

      const data = (await response.json()) as Partial<SiteSettings> | null;
      this.storageStatus.set('synced');

      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        // First run: seed the database with the settings currently shown.
        return this.pushToBackend();
      }

      // If the user already edited settings while the request was in flight,
      // keep the local version and send it to the database instead.
      if (this.localTouched) {
        return this.pushToBackend();
      }

      this.settings.update((current) => ({
        ...current,
        ...data,
        customizerImages: { ...current.customizerImages, ...(data.customizerImages ?? {}) },
      }));
      return true;
    } catch {
      this.storageStatus.set('local');
      return false;
    }
  }

  private async pushToBackend(): Promise<boolean> {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.settings()),
      });
      const ok = response.ok;
      this.storageStatus.set(ok ? 'synced' : 'local');
      return ok;
    } catch {
      this.storageStatus.set('local');
      return false;
    }
  }

  private restore(): SiteSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          customizerImages: { ...DEFAULT_SETTINGS.customizerImages, ...(parsed.customizerImages ?? {}) },
        };
      }
    } catch {}
    return this.cloneDefaults();
  }

  private applyToDocument(s: SiteSettings): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--red', s.primaryColor);
    root.style.setProperty('--gold', s.primaryColor);
    root.style.setProperty('--gold-2', s.primaryColor);
    root.style.setProperty('--ink', s.inkColor);
    root.style.setProperty('--offwhite', s.bgColor);
    document.title = `${s.siteName} — ${s.tagline}`;
  }
}
