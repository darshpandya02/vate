import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from '../services/api.service';
import { of } from 'rxjs';
import { map, catchError, exhaustMap } from 'rxjs/operators';
import * as GroupsActions from './groups.actions';
import { Group } from '../models/group.model';

@Injectable()
export class GroupsEffects {
  loadMyGroups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.loadMyGroups),
      exhaustMap(() =>
        this.api.get<Array<{ group: Group }>>('/groups/my').pipe(
          map((list) => GroupsActions.loadMyGroupsSuccess({
            groups: list.map((x) => x.group),
          })),
          catchError((err) => of(GroupsActions.loadMyGroupsFailure({ error: err.error?.message || 'Failed' }))),
        ),
      ),
    ),
  );

  loadGroupDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GroupsActions.loadGroupDetail),
      exhaustMap(({ id }) =>
        this.api.get<Group>('/groups/' + id).pipe(
          map((group) => GroupsActions.loadGroupDetailSuccess({ group })),
          catchError(() => of(GroupsActions.loadMyGroupsFailure({ error: 'Failed to load group' }))),
        ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
  ) {}
}
