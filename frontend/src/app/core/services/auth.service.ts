import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth.actions';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private api: ApiService,
    private store: Store,
  ) {}

  login(credentials: LoginCredentials) {
    this.store.dispatch(AuthActions.login({ credentials }));
  }

  signUp(data: SignUpData) {
    this.store.dispatch(AuthActions.signUp({ data }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  loadProfile() {
    this.store.dispatch(AuthActions.loadProfile());
  }

  refreshToken(token: string) {
    this.store.dispatch(AuthActions.refreshToken({ refreshToken: token }));
  }
}
