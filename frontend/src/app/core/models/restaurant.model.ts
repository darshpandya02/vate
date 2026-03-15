export interface Restaurant {
  id: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cuisineTypes: string[];
  priceLevel?: number | null;
  rating?: number | null;
  imageUrl?: string | null;
  phone?: string | null;
  website?: string | null;
}
