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
}

const STORAGE_KEY = 'follar.settings.v1';

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
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<SiteSettings>(this.restore());

  constructor() {
    effect(() => {
      const s = this.settings();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {}
      this.applyToDocument(s);
    });
  }

  update(patch: Partial<SiteSettings>): void {
    this.settings.update((current) => ({ ...current, ...patch }));
  }

  reset(): void {
    this.settings.set(DEFAULT_SETTINGS);
  }

  private restore(): SiteSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_SETTINGS;
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
