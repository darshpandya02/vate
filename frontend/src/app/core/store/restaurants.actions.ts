import { createAction, props } from '@ngrx/store';
import { Restaurant } from '../models/restaurant.model';

export const loadDeck = createAction('[Restaurants] Load Deck', props<{ limit?: number; cursor?: string }>());
export const loadDeckSuccess = createAction('[Restaurants] Load Deck Success', props<{ items: Restaurant[]; nextCursor: string | null }>());
export const loadDeckFailure = createAction('[Restaurants] Load Deck Failure', props<{ error: string }>());
export const clearDeck = createAction('[Restaurants] Clear Deck');
