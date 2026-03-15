import { createReducer, on } from '@ngrx/store';
import * as GroupsActions from './groups.actions';
import { Group } from '../models/group.model';

export interface GroupsState {
  list: Group[];
  selected: Group | null;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  list: [],
  selected: null,
  selectedId: null,
  loading: false,
  error: null,
};

export const groupsReducer = createReducer(
  initialState,
  on(GroupsActions.loadMyGroups, (state) => ({ ...state, loading: true, error: null })),
  on(GroupsActions.loadMyGroupsSuccess, (state, { groups }) => ({ ...state, list: groups, loading: false, error: null })),
  on(GroupsActions.loadMyGroupsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(GroupsActions.loadGroupDetailSuccess, (state, { group }) => ({ ...state, selected: group, selectedId: group.id })),
  on(GroupsActions.selectGroup, (state, { id }) => ({ ...state, selectedId: id, selected: id ? state.list.find((g) => g.id === id) ?? state.selected : null })),
);
