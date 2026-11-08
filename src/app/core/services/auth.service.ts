import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AccountRole,
  AccountsService,
  AdminAccount,
  AuthFailure,
} from './accounts.service';

const TOKEN_KEY = 'follar.jwt.token';
const USER_KEY = 'follar.jwt.user';
const ROLE_KEY = 'follar.jwt.role';

export interface LoginResult {
  ok: boolean;
  error?: AuthFailure;
  account?: AdminAccount;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accounts = inject(AccountsService);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly username = signal<string | null>(localStorage.getItem(USER_KEY));
  readonly role = signal<AccountRole | null>(
    (localStorage.getItem(ROLE_KEY) as AccountRole | null) ?? null,
  );

  readonly isLoggedIn = computed(() => Boolean(this.token() && this.username()));
  readonly isSuperAdmin = computed(() => this.role() === 'superadmin');

  /**
   * Simulated JWT authentication. Accounts are managed by the super-admin
   * section; a real deployment must delegate this to Spring Boot + JWT.
   */
  login(username: string, password: string, requiredRole?: AccountRole): LoginResult {
    const { account, error } = this.accounts.authenticate(username, password);
    if (!account) return { ok: false, error };
    if (requiredRole && account.role !== requiredRole) {
      return { ok: false, error: 'forbidden' };
    }

    const mockJwt = this.buildToken(account);
    localStorage.setItem(TOKEN_KEY, mockJwt);
    localStorage.setItem(USER_KEY, account.username);
    localStorage.setItem(ROLE_KEY, account.role);
    this.token.set(mockJwt);
    this.username.set(account.username);
    this.role.set(account.role);
    this.accounts.touchLogin(account.id);
    this.accounts.recordLogin(account.username);
    return { ok: true, account };
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.token.set(null);
    this.username.set(null);
    this.role.set(null);
  }

  /** Drop the session when the account was removed or deactivated meanwhile. */
  ensureValidSession(): void {
    const username = this.username();
    if (!username) return;
    const account = this.accounts.findByUsername(username);
    if (!account || !account.active) {
      this.logout();
      return;
    }
    if (this.role() !== account.role) {
      localStorage.setItem(ROLE_KEY, account.role);
      this.role.set(account.role);
    }
  }

  private buildToken(account: AdminAccount): string {
    const payload = {
      sub: account.username,
      role: account.role === 'superadmin' ? 'ROLE_SUPERADMIN' : 'ROLE_ADMIN',
      iat: Math.floor(Date.now() / 1000),
    };
    const encoded = btoa(JSON.stringify(payload)).replace(/=+$/, '');
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encoded}.mock_signature_follar`;
  }
}
