import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { selectAuthUser } from '../../core/store/auth.selectors';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <h1 class="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Profile</h1>
      @if (user$ | async; as user) {
        <p class="text-stone-600 dark:text-stone-400 mb-6">{{ user.email }}</p>
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Search radius (km)</label>
            <input type="number" formControlName="searchRadiusKm" min="1" max="100"
              class="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900" />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Price range (min–max 1–4)</label>
            <div class="flex gap-2">
              <input type="number" formControlName="priceRangeMin" min="1" max="4" placeholder="Min"
                class="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900" />
              <input type="number" formControlName="priceRangeMax" min="1" max="4" placeholder="Max"
                class="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900" />
            </div>
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-primary-500 text-white font-medium">Save preferences</button>
        </form>
        <button (click)="logout()" class="w-full py-3 mt-6 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300">
          Sign out
        </button>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  user$ = this.store.select(selectAuthUser);
  form: FormGroup;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      searchRadiusKm: [5],
      priceRangeMin: [null],
      priceRangeMax: [null],
    });
  }

  ngOnInit() {
    this.auth.loadProfile();
    this.user$.subscribe((u) => {
      if (u?.profile) {
        this.form.patchValue({
          searchRadiusKm: u.profile.searchRadiusKm ?? 5,
          priceRangeMin: u.profile.priceRangeMin ?? null,
          priceRangeMax: u.profile.priceRangeMax ?? null,
        });
      }
    });
  }

  save() {
    this.api.patch('/users/me/profile', this.form.value).subscribe();
  }

  logout() {
    this.auth.logout();
  }
}
