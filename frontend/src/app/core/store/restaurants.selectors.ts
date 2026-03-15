import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RestaurantsState } from './restaurants.reducer';

export const selectRestaurantsState = createFeatureSelector<RestaurantsState>('restaurants');
export const selectDeck = createSelector(selectRestaurantsState, (s) => s.deck);
export const selectRestaurantsNextCursor = createSelector(selectRestaurantsState, (s) => s.nextCursor);
export const selectRestaurantsLoading = createSelector(selectRestaurantsState, (s) => s.loading);
