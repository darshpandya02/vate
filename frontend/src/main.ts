import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { authReducer } from './app/core/store/auth.reducer';
import { AuthEffects } from './app/core/store/auth.effects';
import { restaurantsReducer } from './app/core/store/restaurants.reducer';
import { RestaurantsEffects } from './app/core/store/restaurants.effects';
import { groupsReducer } from './app/core/store/groups.reducer';
import { GroupsEffects } from './app/core/store/groups.effects';
import { matchesReducer } from './app/core/store/matches.reducer';
import { MatchesEffects } from './app/core/store/matches.effects';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideStore({
      auth: authReducer,
      restaurants: restaurantsReducer,
      groups: groupsReducer,
      matches: matchesReducer,
    }),
    provideEffects([AuthEffects, RestaurantsEffects, GroupsEffects, MatchesEffects]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
}).catch((err) => console.error(err));
