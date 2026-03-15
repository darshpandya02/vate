import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MatchesState } from './matches.reducer';

export const selectMatchesState = createFeatureSelector<MatchesState>('matches');
export const selectMatchesByGroupId = (groupId: string) =>
  createSelector(selectMatchesState, (s) => s.byGroupId[groupId] ?? []);
export const selectMatchesLoading = createSelector(selectMatchesState, (s) => s.loading);
