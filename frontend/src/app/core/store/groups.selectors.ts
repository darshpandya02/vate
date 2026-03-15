import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GroupsState } from './groups.reducer';

export const selectGroupsState = createFeatureSelector<GroupsState>('groups');
export const selectGroupsList = createSelector(selectGroupsState, (s) => s.list);
export const selectGroupsSelected = createSelector(selectGroupsState, (s) => s.selected);
export const selectGroupsLoading = createSelector(selectGroupsState, (s) => s.loading);
