import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'follar.jwt.token';
const USER_KEY = 'follar.jwt.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly username = signal<string | null>(localStorage.getItem(USER_KEY));

  readonly isLoggedIn = signal<boolean>(Boolean(this.token()));

  login(username: string, password: string): boolean {
    // Simulated secure JWT authentication (in real app, calls Spring Boot /api/auth/login)
    if (username.trim() === 'admin' && password === 'follar2026') {
      const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJST0xFX0FETUlOIiwiaWF0IjoxNzQwMDAwMDAwfH0.mock_signature_follar';
      localStorage.setItem(TOKEN_KEY, mockJwt);
      localStorage.setItem(USER_KEY, username);
      this.token.set(mockJwt);
      this.username.set(username);
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.username.set(null);
    this.isLoggedIn.set(false);
  }
}
