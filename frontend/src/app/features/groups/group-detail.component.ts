import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadGroupDetail } from '../../core/store/groups.actions';
import { loadGroupMatches } from '../../core/store/matches.actions';
import { selectGroupsSelected } from '../../core/store/groups.selectors';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <a routerLink="/groups" class="text-primary-600 dark:text-primary-400 text-sm mb-4 inline-block">← Back to groups</a>
      @if (group$ | async; as group) {
        <h1 class="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">{{ group.name }}</h1>
        <p class="text-stone-500 dark:text-stone-400 text-sm mb-4">Invite code: <strong class="text-stone-700 dark:text-stone-300">{{ group.inviteCode }}</strong></p>
        <p class="text-sm text-stone-500 mb-6">{{ group._count?.members ?? 0 }} members · {{ group._count?.matches ?? 0 }} matches</p>
        <h2 class="font-semibold text-stone-800 dark:text-stone-200 mb-2">Members</h2>
        <ul class="space-y-2 mb-8">
          @for (m of group.members; track m.user.id) {
            <li class="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <span class="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-sm">{{ (m.user.name || '?')[0] }}</span>
              {{ m.user.name || m.user.id }}
            </li>
          }
        </ul>
        <a [routerLink]="['/matches']" [queryParams]="{ groupId: group.id }" class="block w-full py-3 rounded-xl bg-primary-500 text-white text-center font-medium">
          View match history
        </a>
      } @else {
        <p class="text-stone-500">Loading...</p>
      }
    </div>
  `,
})
export class GroupDetailComponent implements OnInit {
  group$ = this.store.select(selectGroupsSelected);

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private api: ApiService,
    private ws: WebSocketService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.dispatch(loadGroupDetail({ id }));
      this.store.dispatch(loadGroupMatches({ groupId: id }));
      this.ws.joinGroup(id);
    }
  }
}
