import { createAction, props } from '@ngrx/store';
import { User } from '../models/user.model';

export const login = createAction('[Auth] Login', props<{ credentials: { email: string; password: string } }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ accessToken: string; refreshToken: string; user: User }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const signUp = createAction('[Auth] Sign Up', props<{ data: { email: string; password: string; name: string } }>());
export const signUpSuccess = createAction('[Auth] Sign Up Success', props<{ accessToken: string; refreshToken: string; user: User }>());
export const signUpFailure = createAction('[Auth] Sign Up Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
export const loadProfile = createAction('[Auth] Load Profile');
export const loadProfileSuccess = createAction('[Auth] Load Profile Success', props<{ user: User }>());
export const refreshToken = createAction('[Auth] Refresh Token', props<{ refreshToken: string }>());
export const refreshTokenSuccess = createAction('[Auth] Refresh Token Success', props<{ accessToken: string; refreshToken: string }>());
export const setUser = createAction('[Auth] Set User', props<{ user: User | null }>());
