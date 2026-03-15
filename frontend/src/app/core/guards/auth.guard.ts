import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../store/auth.selectors';

export const authGuard = () => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((ok) => (ok ? true : router.createUrlTree(['/login']))),
  );
};
