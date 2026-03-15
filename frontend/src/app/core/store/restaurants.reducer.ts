import { createReducer, on } from '@ngrx/store';
import { Restaurant } from '../models/restaurant.model';
import * as RestaurantsActions from './restaurants.actions';

export interface RestaurantsState {
  deck: Restaurant[];
  nextCursor: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantsState = {
  deck: [],
  nextCursor: null,
  loading: false,
  error: null,
};

export const restaurantsReducer = createReducer(
  initialState,
  on(RestaurantsActions.loadDeck, (state) => ({ ...state, loading: true, error: null })),
  on(RestaurantsActions.loadDeckSuccess, (state, { items, nextCursor }) => ({
    ...state,
    deck: state.deck.length === 0 ? items : [...state.deck, ...items],
    nextCursor,
    loading: false,
    error: null,
  })),
  on(RestaurantsActions.loadDeckFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(RestaurantsActions.clearDeck, () => initialState),
);
