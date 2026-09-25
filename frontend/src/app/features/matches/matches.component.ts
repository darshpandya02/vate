import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { of, interval, Subscription } from 'rxjs';
import { loadMyGroups } from '../../core/store/groups.actions';
import { loadGroupMatches, loadGroupMatchesSuccess } from '../../core/store/matches.actions';
import { ApiService } from '../../core/services/api.service';
import { GroupMatch } from '../../core/models/match.model';
import { selectGroupsList } from '../../core/store/groups.selectors';
import { selectMatchesByGroupId, selectMatchesLoading } from '../../core/store/matches.selectors';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <h1 class="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Match history</h1>
      @if (selectedGroupId(); as gid) {
        @if (loading$ | async) {
          <p class="text-stone-500">Loading...</p>
        } @else {
          @if (matches$ | async; as matches) {
            <ul class="space-y-4">
              @for (m of matches; track m.id) {
                <li class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <h2 class="font-semibold text-stone-900 dark:text-stone-100">{{ m.restaurant?.name ?? 'Restaurant' }}</h2>
                  @if (m.restaurant?.address) {
                    <p class="text-sm text-stone-500 dark:text-stone-400">{{ m.restaurant?.address }}</p>
                  }
                  <p class="text-xs text-stone-400 mt-2">Matched {{ m.matchedAt | date:'short' }}</p>
                </li>
              }
            </ul>
            @if (matches.length === 0) {
              <p class="text-stone-500 text-center py-8">No matches yet. Swipe right with your group!</p>
            }
          }
        }
      } @else {
        <p class="text-stone-500">Select a group to see matches.</p>
        <ul class="mt-4 space-y-2">
          @for (g of groups$ | async; track g.id) {
            <li>
              <button (click)="selectGroup(g.id)" class="w-full text-left p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                {{ g.name }} ({{ g._count?.matches ?? 0 }} matches)
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class MatchesComponent implements OnInit, OnDestroy {
  selectedGroupId = signal<string | null>(null);
  groups$ = this.store.select(selectGroupsList);
  loading$ = this.store.select(selectMatchesLoading);
  matches$ = toObservable(this.selectedGroupId).pipe(
    switchMap((id) => (id ? this.store.select(selectMatchesByGroupId(id)) : of([]))),
  );

  // Fallback for live updates: realtime events can miss clients connected to a
  // different server instance, so refresh the selected group's matches periodically.
  private poll?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.store.dispatch(loadMyGroups());
    const gid = this.route.snapshot.queryParamMap.get('groupId');
    if (gid) {
      this.selectedGroupId.set(gid);
      this.store.dispatch(loadGroupMatches({ groupId: gid }));
    }
    this.poll = interval(10000).subscribe(() => {
      const id = this.selectedGroupId();
      if (!id) return;
      this.api.get<GroupMatch[]>('/matches/group/' + id).subscribe({
        next: (matches) => this.store.dispatch(loadGroupMatchesSuccess({ groupId: id, matches })),
        error: () => {},
      });
    });
  }

  ngOnDestroy() {
    this.poll?.unsubscribe();
  }

  selectGroup(id: string) {
    this.selectedGroupId.set(id);
    this.store.dispatch(loadGroupMatches({ groupId: id }));
  }
}
