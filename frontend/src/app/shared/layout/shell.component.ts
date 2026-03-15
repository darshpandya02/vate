import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WebSocketService } from '../../core/services/websocket.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950">
      <main class="flex-1 pb-20">
        <router-outlet />
      </main>
      <nav class="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex items-center justify-around safe-area-pb">
        <a routerLink="/swipe" routerLinkActive="text-primary-600" class="flex flex-col items-center gap-1 px-4 py-2 text-stone-500 dark:text-stone-400">
          <span class="text-xl">🍽️</span>
          <span class="text-xs font-medium">Swipe</span>
        </a>
        <a routerLink="/groups" routerLinkActive="text-primary-600" class="flex flex-col items-center gap-1 px-4 py-2 text-stone-500 dark:text-stone-400">
          <span class="text-xl">👥</span>
          <span class="text-xs font-medium">Groups</span>
        </a>
        <a routerLink="/matches" routerLinkActive="text-primary-600" class="flex flex-col items-center gap-1 px-4 py-2 text-stone-500 dark:text-stone-400">
          <span class="text-xl">❤️</span>
          <span class="text-xs font-medium">Matches</span>
        </a>
        <a routerLink="/profile" routerLinkActive="text-primary-600" class="flex flex-col items-center gap-1 px-4 py-2 text-stone-500 dark:text-stone-400">
          <span class="text-xl">⚙️</span>
          <span class="text-xs font-medium">Profile</span>
        </a>
      </nav>
    </div>
  `,
})
export class ShellComponent implements OnInit {
  constructor(private ws: WebSocketService) {}
  ngOnInit() {
    this.ws.connectIfToken();
  }
}
