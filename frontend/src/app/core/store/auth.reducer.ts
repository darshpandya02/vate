import { createReducer, on } from '@ngrx/store';
import { User } from '../models/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

function getInitialState(): AuthState {
  try {
    const raw = localStorage.getItem('vate_auth');
    const stored = raw ? JSON.parse(raw) : null;
    if (stored?.accessToken && stored?.user) {
      return {
        user: stored.user as User,
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken ?? null,
        loading: false,
        error: null,
      };
    }
  } catch {}
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
  };
}

const initialState: AuthState = getInitialState();

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.signUp, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, AuthActions.signUpSuccess, (state, { accessToken, refreshToken, user }) => ({
    ...state,
    accessToken,
    refreshToken,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, AuthActions.signUpFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logout, () => initialState),
  on(AuthActions.loadProfileSuccess, AuthActions.setUser, (state, { user }) => ({ ...state, user: user ?? state.user })),
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({ ...state, accessToken, refreshToken })),
);
