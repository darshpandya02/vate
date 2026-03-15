import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { loadMyGroups } from '../../core/store/groups.actions';
import { selectGroupsList, selectGroupsLoading } from '../../core/store/groups.selectors';
import { ApiService } from '../../core/services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <h1 class="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Groups</h1>
      <div class="flex gap-2 mb-4">
        <input [(ngModel)]="newGroupName" placeholder="Group name" class="flex-1 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900" />
        <button (click)="createGroup()" class="px-4 py-2 rounded-xl bg-primary-500 text-white font-medium">Create</button>
      </div>
      <div class="flex gap-2 mb-6">
        <input [(ngModel)]="inviteCode" placeholder="Invite code" class="flex-1 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900" />
        <button (click)="joinGroup()" class="px-4 py-2 rounded-xl bg-accent-500 text-white font-medium">Join</button>
      </div>
      @if (loading$ | async) {
        <p class="text-stone-500">Loading...</p>
      } @else {
        <ul class="space-y-3">
          @for (item of list$ | async; track item.id) {
            <li>
              <a [routerLink]="['/groups', item.id]" class="block p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <h2 class="font-semibold text-stone-900 dark:text-stone-100">{{ item.name }}</h2>
                <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {{ item._count?.members ?? 0 }} members · {{ item._count?.matches ?? 0 }} matches
                </p>
                <p class="text-xs text-stone-400 mt-1">Code: {{ item.inviteCode }}</p>
              </a>
            </li>
          }
        </ul>
        @if ((list$ | async)?.length === 0) {
          <p class="text-stone-500 text-center py-8">No groups yet. Create one or join with a code.</p>
        }
      }
    </div>
  `,
})
export class GroupsComponent implements OnInit {
  list$ = this.store.select(selectGroupsList);
  loading$ = this.store.select(selectGroupsLoading);
  newGroupName = '';
  inviteCode = '';

  constructor(
    private store: Store,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.store.dispatch(loadMyGroups());
  }

  createGroup() {
    if (!this.newGroupName.trim()) return;
    this.api.post('/groups', { name: this.newGroupName.trim() }).subscribe({
      next: () => {
        this.newGroupName = '';
        this.store.dispatch(loadMyGroups());
      },
    });
  }

  joinGroup() {
    if (!this.inviteCode.trim()) return;
    this.api.post('/groups/join', { inviteCode: this.inviteCode.trim().toUpperCase() }).subscribe({
      next: () => {
        this.inviteCode = '';
        this.store.dispatch(loadMyGroups());
      },
    });
  }
}
