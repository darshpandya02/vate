import { Injectable } from '@angular/core';

const KEY = 'vate_auth';

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  get(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set(data: StoredAuth): void {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  clear(): void {
    localStorage.removeItem(KEY);
  }
}
