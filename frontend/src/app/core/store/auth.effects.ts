import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from '../services/api.service';
import { AuthStorageService } from '../services/auth-storage.service';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ credentials }) =>
        this.api.post<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/login', credentials).pipe(
          map((res) => AuthActions.loginSuccess({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            user: res.user as Parameters<typeof AuthActions.loginSuccess>[0]['user'],
          })),
          catchError((err) => of(AuthActions.loginFailure({ error: err.error?.message || 'Login failed' }))),
        ),
      ),
    ),
  );

  signUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signUp),
      exhaustMap(({ data }) =>
        this.api.post<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/signup', data).pipe(
          map((res) => AuthActions.signUpSuccess({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            user: res.user as Parameters<typeof AuthActions.signUpSuccess>[0]['user'],
          })),
          catchError((err) => of(AuthActions.signUpFailure({ error: err.error?.message || 'Sign up failed' }))),
        ),
      ),
    ),
  );

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadProfile),
      exhaustMap(() =>
        this.api.get<unknown>('/users/me').pipe(
          map((user) => AuthActions.loadProfileSuccess({ user: user as Parameters<typeof AuthActions.loadProfileSuccess>[0]['user'] })),
          catchError(() => of(AuthActions.setUser({ user: null }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.signUpSuccess),
        tap((action) => {
          this.storage.set({
            accessToken: action.accessToken,
            refreshToken: action.refreshToken,
            user: action.user,
          });
          this.router.navigate(['/swipe']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.storage.clear();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private router: Router,
    private storage: AuthStorageService,
  ) {}
}
