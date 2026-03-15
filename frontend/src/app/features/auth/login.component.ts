import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from '../../core/services/auth.service';
import { selectAuthLoading, selectAuthError } from '../../core/store/auth.selectors';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 dark:bg-stone-950">
      <div class="w-full max-w-sm">
        <h1 class="font-display text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-2">Vate</h1>
        <p class="text-center text-stone-600 dark:text-stone-400 mb-8">Swipe for restaurants. Match with your group.</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
            <input type="email" formControlName="email" autocomplete="email"
              class="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Password</label>
            <input type="password" formControlName="password" autocomplete="current-password"
              class="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-primary-500" />
          </div>
          @if (error$ | async; as err) {
            <p class="text-red-600 dark:text-red-400 text-sm">{{ err }}</p>
          }
          <button type="submit" [disabled]="form.invalid || (loading$ | async)"
            class="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold disabled:opacity-50">
            {{ (loading$ | async) ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
        <p class="mt-6 text-center text-stone-600 dark:text-stone-400">
          No account? <a routerLink="/signup" class="text-primary-600 dark:text-primary-400 font-medium">Sign up</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  form: FormGroup;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.auth.login(this.form.value);
    }
  }
}
