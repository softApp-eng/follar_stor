import { Injectable, computed, signal } from '@angular/core';

export type AccountRole = 'admin' | 'superadmin';

export interface AdminAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: AccountRole;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
  createdBy: string;
}

export type AccountAction =
  | 'created'
  | 'updated'
  | 'activated'
  | 'deactivated'
  | 'deleted'
  | 'password';

export interface AccountEvent {
  id: string;
  date: string;
  actor: string;
  action: AccountAction;
  target: string;
  detail?: string;
}

export type AuthFailure = 'invalid' | 'inactive' | 'forbidden';

export interface CreateAccountInput {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: AccountRole;
  active?: boolean;
}

export interface UpdateAccountInput {
  fullName?: string;
  email?: string;
  role?: AccountRole;
  active?: boolean;
  password?: string;
}

export interface AccountResult {
  ok: boolean;
  error?: string;
  account?: AdminAccount;
}

const ACCOUNTS_KEY = 'follar.accounts.v1';
const LOG_KEY = 'follar.accounts.log.v1';
const MAX_EVENTS = 60;

/**
 * Tiny non-cryptographic hash. This app simulates JWT authentication on the
 * front end: it keeps demo passwords out of plain text in localStorage, but a
 * production build must create and verify accounts server-side (BCrypt/Argon2).
 */
function hashPassword(password: string): string {
  const input = `follar::${password}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function seedAccounts(): AdminAccount[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'acc-superadmin',
      username: 'superadmin',
      fullName: 'Super Administrateur',
      email: 'super@follar.paris',
      role: 'superadmin',
      passwordHash: hashPassword('superfollar2026'),
      active: true,
      createdAt: now,
      createdBy: 'Système',
    },
    {
      id: 'acc-admin',
      username: 'admin',
      fullName: 'Administrateur FOLLAR',
      email: 'bonjour@follar.paris',
      role: 'admin',
      passwordHash: hashPassword('follar2026'),
      active: true,
      createdAt: now,
      createdBy: 'Système',
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class AccountsService {
  readonly accounts = signal<AdminAccount[]>(this.restoreAccounts());
  readonly events = signal<AccountEvent[]>(this.restoreEvents());

  readonly activeAccounts = computed(() => this.accounts().filter((a) => a.active));
  readonly inactiveAccounts = computed(() => this.accounts().filter((a) => !a.active));
  readonly superAdmins = computed(() =>
    this.accounts().filter((a) => a.role === 'superadmin' && a.active),
  );

  /** Authenticate a username/password pair. Inactive accounts are refused. */
  authenticate(
    username: string,
    password: string,
  ): { account?: AdminAccount; error?: AuthFailure } {
    const account = this.findByUsername(username);
    if (!account) return { error: 'invalid' };
    if (!account.active) return { error: 'inactive' };
    if (account.passwordHash !== hashPassword(password)) return { error: 'invalid' };
    return { account };
  }

  findByUsername(username: string): AdminAccount | undefined {
    const needle = username.trim().toLowerCase();
    if (!needle) return undefined;
    return this.accounts().find((a) => a.username.toLowerCase() === needle);
  }

  findById(id: string): AdminAccount | undefined {
    return this.accounts().find((a) => a.id === id);
  }

  touchLogin(id: string): void {
    const now = new Date().toISOString();
    this.accounts.update((list) => {
      const next = list.map((a) => (a.id === id ? { ...a, lastLoginAt: now } : a));
      this.saveAccounts(next);
      return next;
    });
  }

  createAccount(input: CreateAccountInput, actor: string): AccountResult {
    const username = input.username.trim();
    const fullName = input.fullName.trim();
    const email = input.email.trim();
    const password = input.password;

    if (username.length < 3) {
      return { ok: false, error: 'L’identifiant doit contenir au moins 3 caractères.' };
    }
    if (!/^[a-z0-9._-]+$/i.test(username)) {
      return { ok: false, error: 'Identifiant invalide (lettres, chiffres, point, tiret).' };
    }
    if (this.findByUsername(username)) {
      return { ok: false, error: 'Cet identifiant est déjà utilisé.' };
    }
    if (fullName.length < 2) {
      return { ok: false, error: 'Indiquez le nom complet du compte.' };
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Adresse e-mail invalide.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }

    const account: AdminAccount = {
      id: `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      username,
      fullName,
      email,
      role: input.role,
      passwordHash: hashPassword(password),
      active: input.active ?? true,
      createdAt: new Date().toISOString(),
      createdBy: actor,
    };

    this.accounts.update((list) => {
      const next = [...list, account];
      this.saveAccounts(next);
      return next;
    });
    this.log(actor, 'created', username, `Compte ${input.role} créé.`);
    return { ok: true, account };
  }

  updateAccount(id: string, patch: UpdateAccountInput, actor: string): AccountResult {
    const current = this.findById(id);
    if (!current) return { ok: false, error: 'Compte introuvable.' };

    const email = patch.email?.trim() ?? current.email;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Adresse e-mail invalide.' };
    }
    if (patch.password && patch.password.length < 6) {
      return { ok: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }
    if (patch.role === 'admin' && current.role === 'superadmin') {
      const otherSuperAdmins = this.superAdmins().filter((a) => a.id !== id);
      if (otherSuperAdmins.length === 0) {
        return { ok: false, error: 'Impossible : il doit rester au moins un super-admin actif.' };
      }
    }

    const next: AdminAccount = {
      ...current,
      fullName: patch.fullName?.trim() || current.fullName,
      email,
      role: patch.role ?? current.role,
      active: patch.active ?? current.active,
      passwordHash: patch.password ? hashPassword(patch.password) : current.passwordHash,
    };

    this.accounts.update((list) => {
      const updated = list.map((a) => (a.id === id ? next : a));
      this.saveAccounts(updated);
      return updated;
    });
    if (patch.password) {
      this.log(actor, 'password', next.username, 'Mot de passe réinitialisé.');
    } else {
      this.log(actor, 'updated', next.username, 'Informations du compte mises à jour.');
    }
    return { ok: true, account: next };
  }

  setActive(id: string, active: boolean, actor: string): AccountResult {
    const current = this.findById(id);
    if (!current) return { ok: false, error: 'Compte introuvable.' };
    if (!active && current.role === 'superadmin') {
      const otherSuperAdmins = this.superAdmins().filter((a) => a.id !== id);
      if (otherSuperAdmins.length === 0) {
        return { ok: false, error: 'Impossible de désactiver le dernier super-admin actif.' };
      }
    }

    this.accounts.update((list) => {
      const next = list.map((a) => (a.id === id ? { ...a, active } : a));
      this.saveAccounts(next);
      return next;
    });
    this.log(
      actor,
      active ? 'activated' : 'deactivated',
      current.username,
      active ? 'Compte activé.' : 'Compte désactivé.',
    );
    return { ok: true };
  }

  deleteAccount(id: string, actor: string): AccountResult {
    const current = this.findById(id);
    if (!current) return { ok: false, error: 'Compte introuvable.' };
    if (current.role === 'superadmin') {
      const otherSuperAdmins = this.accounts().filter(
        (a) => a.role === 'superadmin' && a.id !== id,
      );
      if (otherSuperAdmins.length === 0) {
        return { ok: false, error: 'Impossible de supprimer le dernier super-admin.' };
      }
    }

    this.accounts.update((list) => {
      const next = list.filter((a) => a.id !== id);
      this.saveAccounts(next);
      return next;
    });
    this.log(actor, 'deleted', current.username, 'Compte supprimé.');
    return { ok: true };
  }

  /** Called after a successful login to record it in the journal. */
  recordLogin(username: string): void {
    this.log(username, 'updated', username, 'Connexion réussie.', false);
  }

  private log(
    actor: string,
    action: AccountAction,
    target: string,
    detail: string,
    persist = true,
  ): void {
    const event: AccountEvent = {
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      date: new Date().toISOString(),
      actor,
      action,
      target,
      detail,
    };
    this.events.update((list) => {
      const next = [event, ...list].slice(0, MAX_EVENTS);
      if (persist) this.saveEvents(next);
      return next;
    });
  }

  private restoreAccounts(): AdminAccount[] {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as AdminAccount[];
        }
      }
    } catch {}
    const seeded = seedAccounts();
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seeded));
    } catch {}
    return seeded;
  }

  private restoreEvents(): AccountEvent[] {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as AccountEvent[];
      }
    } catch {}
    return [];
  }

  private saveAccounts(list: AdminAccount[]): void {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
    } catch {}
  }

  private saveEvents(list: AccountEvent[]): void {
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(list));
    } catch {}
  }
}
