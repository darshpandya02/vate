export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  profile?: {
    latitude?: number;
    longitude?: number;
    searchRadiusKm?: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
    dietaryPreferences?: string[];
    cuisinePreferences?: string[];
  };
}
