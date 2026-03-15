import { createReducer, on } from '@ngrx/store';
import { GroupMatch } from '../models/match.model';
import * as MatchesActions from './matches.actions';

export interface MatchesState {
  byGroupId: Record<string, GroupMatch[]>;
  loading: boolean;
  error: string | null;
}

const initialState: MatchesState = {
  byGroupId: {},
  loading: false,
  error: null,
};

export const matchesReducer = createReducer(
  initialState,
  on(MatchesActions.loadGroupMatches, (state) => ({ ...state, loading: true, error: null })),
  on(MatchesActions.loadGroupMatchesSuccess, (state, { groupId, matches }) => ({
    ...state,
    byGroupId: { ...state.byGroupId, [groupId]: matches },
    loading: false,
    error: null,
  })),
  on(MatchesActions.loadGroupMatchesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(MatchesActions.addLiveMatch, (state, { groupId, match }) => ({
    ...state,
    byGroupId: {
      ...state.byGroupId,
      [groupId]: [match, ...(state.byGroupId[groupId] || [])],
    },
  })),
);
