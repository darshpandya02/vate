import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ApiService } from '../../core/services/api.service';
import { selectDeck, selectRestaurantsLoading } from '../../core/store/restaurants.selectors';
import { loadDeck, clearDeck } from '../../core/store/restaurants.actions';
import { Restaurant } from '../../core/models/restaurant.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <h1 class="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Restaurants</h1>
      @if (loading$ | async) {
        <div class="flex justify-center py-12">
          <span class="text-stone-500">Loading...</span>
        </div>
      } @else {
        <div class="relative h-[420px] flex justify-center items-center">
          @for (restaurant of displayDeck(); track restaurant.id; let i = $index) {
            <div
              class="swipe-card absolute w-full max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-stone-800 transition-transform duration-200"
              [style.z-index]="displayDeck().length - i"
              [style.transform]="getTransform(i)()"
              (touchstart)="onTouchStart($event, i)"
              (touchmove)="onTouchMove($event, i)"
              (touchend)="onTouchEnd(i)"
              (mousedown)="onMouseDown($event, i)"
              (mousemove)="onMouseMove($event, i)"
              (mouseup)="onMouseUp(i)"
              (mouseleave)="onMouseUp(i)"
            >
              <div class="aspect-[3/4] bg-stone-200 dark:bg-stone-700 relative">
                @if (restaurant.imageUrl) {
                  <img [src]="restaurant.imageUrl" [alt]="restaurant.name" class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                }
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h2 class="font-display text-xl font-bold">{{ restaurant.name }}</h2>
                  @if (restaurant.address) {
                    <p class="text-sm opacity-90">{{ restaurant.address }}</p>
                  }
                  <div class="flex gap-2 mt-2">
                    @for (cuisine of restaurant.cuisineTypes.slice(0, 3); track cuisine) {
                      <span class="text-xs px-2 py-0.5 rounded-full bg-white/20">{{ cuisine }}</span>
                    }
                  </div>
                  @if (restaurant.rating != null) {
                    <p class="text-sm mt-1">★ {{ restaurant.rating }}</p>
                  }
                </div>
              </div>
            </div>
          }
          @if (displayDeck().length === 0 && !(loading$ | async)) {
            <div class="text-center text-stone-500 py-12">
              <p class="text-lg">No more restaurants right now.</p>
              <p class="text-sm mt-2">Check back later or update your preferences.</p>
            </div>
          }
        </div>
        <div class="flex justify-center gap-8 mt-6">
          <button (click)="swipeLeft()" class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl shadow"
            [disabled]="displayDeck().length === 0">
            ✕
          </button>
          <button (click)="swipeRight()" class="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 flex items-center justify-center text-2xl shadow"
            [disabled]="displayDeck().length === 0">
            ♥
          </button>
        </div>
      }
    </div>
  `,
})
export class SwipeComponent implements OnInit, OnDestroy {
  loading$ = this.store.select(selectRestaurantsLoading);
  displayDeck = signal<Restaurant[]>([]);
  dragOffset = signal({ x: 0, y: 0 });
  topIndex = signal(0);
  private dragStart = { x: 0, y: 0 };
  private isDragging = false;
  private currentCardIndex = 0;
  private sub: unknown;
  private swipedIds = new Set<string>();

  getTransform = (i: number) => {
    return computed(() => {
      const deck = this.displayDeck();
      const offset = this.dragOffset();
      const top = this.topIndex();
      if (i !== top) return '';
      const x = offset.x;
      const rotate = Math.min(20, Math.max(-20, x / 10));
      return `translate(${x}px, ${offset.y}px) rotate(${rotate}deg)`;
    });
  };

  constructor(
    private store: Store,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.store.dispatch(clearDeck());
    this.store.dispatch(loadDeck({ limit: 10 }));
    this.sub = this.store.select(selectDeck).subscribe((deck) => {
      // The prefetch appends to the stored deck, so drop cards already swiped and duplicates.
      const seen = new Set<string>();
      this.displayDeck.set(deck.filter((r) => !this.swipedIds.has(r.id) && !seen.has(r.id) && !!seen.add(r.id)));
      this.topIndex.set(0);
    });
  }

  ngOnDestroy() {
    if (this.sub && typeof (this.sub as { unsubscribe: () => void }).unsubscribe === 'function') {
      (this.sub as { unsubscribe: () => void }).unsubscribe();
    }
  }

  swipeLeft() {
    this.swipe('LEFT');
  }

  swipeRight() {
    this.swipe('RIGHT');
  }

  private swipe(direction: 'LEFT' | 'RIGHT') {
    const deck = this.displayDeck();
    if (deck.length === 0) return;
    const top = deck[0];
    this.api.post('/swipes', { restaurantId: top.id, direction }).subscribe({
      next: () => {
        this.swipedIds.add(top.id);
        this.displayDeck.set(deck.slice(1));
        this.store.dispatch(loadDeck({ limit: 5 })); // prefetch more
      },
      error: () => {},
    });
  }

  onTouchStart(e: TouchEvent, i: number) {
    if (i !== this.topIndex()) return;
    this.isDragging = true;
    this.dragStart = { x: e.touches[0].clientX - this.dragOffset().x, y: e.touches[0].clientY - this.dragOffset().y };
  }

  onTouchMove(e: TouchEvent, i: number) {
    if (!this.isDragging || i !== this.topIndex()) return;
    this.dragOffset.set({
      x: e.touches[0].clientX - this.dragStart.x,
      y: e.touches[0].clientY - this.dragStart.y,
    });
  }

  onTouchEnd(i: number) {
    if (i !== this.topIndex()) return;
    this.isDragging = false;
    const offset = this.dragOffset();
    if (offset.x < -80) this.swipeLeft();
    else if (offset.x > 80) this.swipeRight();
    this.dragOffset.set({ x: 0, y: 0 });
  }

  onMouseDown(e: MouseEvent, i: number) {
    if (i !== this.topIndex()) return;
    this.isDragging = true;
    this.dragStart = { x: e.clientX - this.dragOffset().x, y: e.clientY - this.dragOffset().y };
  }

  onMouseMove(e: MouseEvent, i: number) {
    if (!this.isDragging || i !== this.topIndex()) return;
    this.dragOffset.set({
      x: e.clientX - this.dragStart.x,
      y: e.clientY - this.dragStart.y,
    });
  }

  onMouseUp(i: number) {
    if (i !== this.topIndex()) return;
    this.isDragging = false;
    const offset = this.dragOffset();
    if (offset.x < -80) this.swipeLeft();
    else if (offset.x > 80) this.swipeRight();
    this.dragOffset.set({ x: 0, y: 0 });
  }
}
