import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectAuthUser = createSelector(selectAuthState, (s) => s.user);
export const selectAuthToken = createSelector(selectAuthState, (s) => s.accessToken);
export const selectRefreshToken = createSelector(selectAuthState, (s) => s.refreshToken);
export const selectAuthLoading = createSelector(selectAuthState, (s) => s.loading);
export const selectAuthError = createSelector(selectAuthState, (s) => s.error);
export const selectIsAuthenticated = createSelector(selectAuthToken, (t) => !!t);
