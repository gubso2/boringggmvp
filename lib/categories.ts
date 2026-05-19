import {
  Bed,
  Coffee,
  Droplets,
  Dumbbell,
  Footprints,
  Headphones,
  Keyboard,
  Moon,
  Radio,
  Shirt,
  ShowerHead,
  Snowflake,
  Sparkles,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Category slug → lucide icon. Add new categories here when seeding more
 * products; unknown slugs fall back to a Sparkles glyph.
 */
const ICONS: Record<string, LucideIcon> = {
  audio: Headphones,
  desk: Keyboard,
  apparel: Shirt,
  footwear: Footprints,
  coffee: Coffee,
  bedroom: Bed,
  hydration: Droplets,
  carry: Wallet,
  gadgets: Radio,
  fitness: Dumbbell,
  kitchen: UtensilsCrossed,
  sleep: Moon,
  bath: ShowerHead,
  recovery: Snowflake,
};

const LABELS: Record<string, string> = {
  audio: "Audio",
  desk: "Desk",
  apparel: "Apparel",
  footwear: "Footwear",
  coffee: "Coffee",
  bedroom: "Bedroom",
  hydration: "Hydration",
  carry: "Carry",
  gadgets: "Gadgets",
  fitness: "Fitness",
  kitchen: "Kitchen",
  sleep: "Sleep",
  bath: "Bath",
  recovery: "Recovery",
};

export function categoryIcon(category: string): LucideIcon {
  return ICONS[category] ?? Sparkles;
}

export function categoryLabel(category: string): string {
  return LABELS[category] ?? "Misc";
}
