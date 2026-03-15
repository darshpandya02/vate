import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from '../services/api.service';
import { of } from 'rxjs';
import { map, catchError, exhaustMap } from 'rxjs/operators';
import * as MatchesActions from './matches.actions';
import { GroupMatch } from '../models/match.model';

@Injectable()
export class MatchesEffects {
  loadGroupMatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MatchesActions.loadGroupMatches),
      exhaustMap(({ groupId }) =>
        this.api.get<GroupMatch[]>('/matches/group/' + groupId).pipe(
          map((matches) => MatchesActions.loadGroupMatchesSuccess({ groupId, matches })),
          catchError((err) => of(MatchesActions.loadGroupMatchesFailure({ error: err.error?.message || 'Failed' }))),
        ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
  ) {}
}
