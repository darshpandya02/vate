import { createAction, props } from '@ngrx/store';
import { GroupMatch } from '../models/match.model';

export const loadGroupMatches = createAction('[Matches] Load Group Matches', props<{ groupId: string }>());
export const loadGroupMatchesSuccess = createAction('[Matches] Load Group Matches Success', props<{ groupId: string; matches: GroupMatch[] }>());
export const loadGroupMatchesFailure = createAction('[Matches] Load Group Matches Failure', props<{ error: string }>());
export const addLiveMatch = createAction('[Matches] Add Live Match', props<{ groupId: string; match: GroupMatch }>());
