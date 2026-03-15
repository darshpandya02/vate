import { createAction, props } from '@ngrx/store';
import { Group } from '../models/group.model';

export const loadMyGroups = createAction('[Groups] Load My Groups');
export const loadMyGroupsSuccess = createAction('[Groups] Load My Groups Success', props<{ groups: Group[] }>());
export const loadMyGroupsFailure = createAction('[Groups] Load My Groups Failure', props<{ error: string }>());
export const loadGroupDetail = createAction('[Groups] Load Group Detail', props<{ id: string }>());
export const loadGroupDetailSuccess = createAction('[Groups] Load Group Detail Success', props<{ group: Group }>());
export const selectGroup = createAction('[Groups] Select Group', props<{ id: string | null }>());
