import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from '../services/api.service';
import { Restaurant } from '../models/restaurant.model';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as RestaurantsActions from './restaurants.actions';
import { selectRestaurantsNextCursor } from './restaurants.selectors';

@Injectable()
export class RestaurantsEffects {
  loadDeck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RestaurantsActions.loadDeck),
      withLatestFrom(this.store.select(selectRestaurantsNextCursor)),
      exhaustMap(([{ limit, cursor }, nextCursor]) => {
        const params: Record<string, string> = {};
        if (limit) params['limit'] = String(limit);
        if (cursor ?? nextCursor) params['cursor'] = (cursor ?? nextCursor) ?? '';
        return this.api.get<{ items: Restaurant[]; nextCursor: string | null }>('/restaurants', params).pipe(
          map((res) => RestaurantsActions.loadDeckSuccess({ items: res.items, nextCursor: res.nextCursor })),
          catchError((err) => of(RestaurantsActions.loadDeckFailure({ error: err.error?.message || 'Failed to load' }))),
        );
      }),
    ),
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store,
  ) {}
}
