import { Landmark, MapPin, Palette, ShoppingBag, Star, Trees, Utensils } from "lucide-react";

// The icon of each kind of place (constants/itineraryPreferences MUST_VISIT_CATEGORIES)
export const CATEGORY_ICONS = { food: Utensils, sight: Landmark, museum: Palette, nature: Trees, shopping: ShoppingBag, town: MapPin, other: Star };

export const iconOf = (category) => CATEGORY_ICONS[category] ?? Star;
