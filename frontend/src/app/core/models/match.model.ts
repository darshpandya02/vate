import { Restaurant } from './restaurant.model';

export interface GroupMatch {
  id: string;
  groupId: string;
  restaurantId: string;
  matchedAt: string;
  restaurant?: Restaurant;
}
