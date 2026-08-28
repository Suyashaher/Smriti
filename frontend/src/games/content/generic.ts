export type ItemCategory = "object" | "fruit" | "utensil" | "activity";

export interface ContentItem {
  id: string;
  emoji: string;
  labelKey: string;
  category: ItemCategory;
}

export interface RoutineStep {
  id: string;
  emoji: string;
  labelKey: string;
}

export interface PatternColor {
  id: string;
  className: string;
  labelKey: string;
}

/** Culturally neutral, bundled locally. Labels come from i18n keys. */
export const GENERIC_ITEMS: ContentItem[] = [
  // Existing
  { id: "cup", emoji: "☕", labelKey: "content.cup", category: "utensil" },
  { id: "book", emoji: "📖", labelKey: "content.book", category: "object" },
  { id: "apple", emoji: "🍎", labelKey: "content.apple", category: "fruit" },
  { id: "chair", emoji: "🪑", labelKey: "content.chair", category: "object" },
  { id: "rice", emoji: "🍚", labelKey: "content.rice", category: "object" },
  { id: "tea", emoji: "🫖", labelKey: "content.tea", category: "object" },
  { id: "banana", emoji: "🍌", labelKey: "content.banana", category: "fruit" },
  { id: "orange", emoji: "🍊", labelKey: "content.orange", category: "fruit" },
  { id: "spoon", emoji: "🥄", labelKey: "content.spoon", category: "utensil" },
  { id: "bowl", emoji: "🥣", labelKey: "content.bowl", category: "utensil" },
  { id: "key", emoji: "🔑", labelKey: "content.key", category: "object" },
  { id: "shoe", emoji: "👟", labelKey: "content.shoe", category: "object" },
  // Culturally Relevant additions for NER
  { id: "mango", emoji: "🥭", labelKey: "content.mango", category: "fruit" },
  { id: "pineapple", emoji: "🍍", labelKey: "content.pineapple", category: "fruit" },
  { id: "jackfruit", emoji: "🍈", labelKey: "content.jackfruit", category: "fruit" },
  { id: "umbrella", emoji: "☂️", labelKey: "content.umbrella", category: "object" },
  { id: "plate", emoji: "🍽️", labelKey: "content.plate", category: "utensil" },
  { id: "water", emoji: "💧", labelKey: "content.water", category: "object" },
];

export const DEFAULT_ROUTINE: RoutineStep[] = [
  { id: "wake", emoji: "🌅", labelKey: "content.wake" },
  { id: "prayer", emoji: "🙏", labelKey: "content.prayer" },
  { id: "breakfast", emoji: "🍳", labelKey: "content.breakfast" },
  { id: "medicine", emoji: "💊", labelKey: "content.medicine" },
  { id: "activity", emoji: "🧠", labelKey: "content.cognitiveActivity" },
  { id: "lunch", emoji: "🍲", labelKey: "content.lunch" },
  { id: "rest", emoji: "🛏️", labelKey: "content.rest" },
  { id: "walk", emoji: "🚶", labelKey: "content.walk" },
  { id: "bedtime", emoji: "🌙", labelKey: "content.bedtime" }
];

export const PATTERN_COLORS: PatternColor[] = [
  { id: "red", className: "bg-red-700 text-white", labelKey: "content.colorRed" },
  { id: "blue", className: "bg-blue-800 text-white", labelKey: "content.colorBlue" },
  { id: "yellow", className: "bg-yellow-400 text-elder-ink", labelKey: "content.colorYellow" },
];

export function fruitsOf(items: readonly ContentItem[]): ContentItem[] {
  return items.filter((item) => item.category === "fruit");
}

export function nonFruitsOf(items: readonly ContentItem[]): ContentItem[] {
  return items.filter((item) => item.category !== "fruit");
}
