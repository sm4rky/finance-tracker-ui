import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Baby,
  Beef,
  Beer,
  Bird,
  Bone,
  BookOpen,
  Briefcase,
  Building,
  Bus,
  Car,
  Cat,
  ChessKnight,
  CircleDollarSign,
  CircleHelp,
  Clapperboard,
  Coffee,
  CupSoda,
  Dog,
  DollarSign,
  Drumstick,
  Dumbbell,
  Fish,
  Fuel,
  Gift,
  GraduationCap,
  Hamburger,
  Hammer,
  HandCoins,
  HeartPulse,
  Helicopter,
  Home,
  Landmark,
  Laptop,
  LeafyGreen,
  PawPrint,
  PersonStanding,
  PiggyBank,
  Pizza,
  Plane,
  Rat,
  School,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Tag,
  Train,
  UserRound,
  UsersRound,
  UtensilsCrossed,
  Volleyball,
  Wallet,
  Wrench,
} from "lucide-react";

export type CustomCategoryIconMeta = {
  displayName: string;
  Icon: LucideIcon;
};

export const DEFAULT_CUSTOM_CATEGORY_ICON = "tag";

export const CUSTOM_CATEGORY_ICON_METAS: Record<
  string,
  CustomCategoryIconMeta
> = {
  tag: {
    displayName: "Tag",
    Icon: Tag,
  },
  wallet: {
    displayName: "Wallet",
    Icon: Wallet,
  },
  "dollar-sign": {
    displayName: "Dollar",
    Icon: DollarSign,
  },
  "circle-dollar-sign": {
    displayName: "Circle Dollar",
    Icon: CircleDollarSign,
  },
  "piggy-bank": {
    displayName: "Savings",
    Icon: PiggyBank,
  },
  "hand-coins": {
    displayName: "Hand Coins",
    Icon: HandCoins,
  },
  "utensils-crossed": {
    displayName: "Food & Drink",
    Icon: UtensilsCrossed,
  },
  hamburger: {
    displayName: "Hamburger",
    Icon: Hamburger,
  },
  pizza: {
    displayName: "Pizza",
    Icon: Pizza,
  },
  beef: {
    displayName: "Beef",
    Icon: Beef,
  },
  drumstick: {
    displayName: "Drumstick",
    Icon: Drumstick,
  },
  fish: {
    displayName: "Fish",
    Icon: Fish,
  },
  "leafy-green": {
    displayName: "Leafy Green",
    Icon: LeafyGreen,
  },
  coffee: {
    displayName: "Coffee",
    Icon: Coffee,
  },
  "cup-soda": {
    displayName: "Soda",
    Icon: CupSoda,
  },
  beer: {
    displayName: "Beer",
    Icon: Beer,
  },
  car: {
    displayName: "Car",
    Icon: Car,
  },
  bus: {
    displayName: "Bus",
    Icon: Bus,
  },
  train: {
    displayName: "Train",
    Icon: Train,
  },
  plane: {
    displayName: "Travel",
    Icon: Plane,
  },
  helicopter: {
    displayName: "Helicopter",
    Icon: Helicopter,
  },
  fuel: {
    displayName: "Fuel",
    Icon: Fuel,
  },
  home: {
    displayName: "Home",
    Icon: Home,
  },
  building: {
    displayName: "Property",
    Icon: Building,
  },
  smart_phone: {
    displayName: "Technology",
    Icon: Smartphone,
  },
  laptop: {
    displayName: "Laptop",
    Icon: Laptop,
  },
  "shopping-bag": {
    displayName: "Shopping bag",
    Icon: ShoppingBag,
  },
  "shopping-cart": {
    displayName: "Shopping cart",
    Icon: ShoppingCart,
  },
  clapperboard: {
    displayName: "Entertainment",
    Icon: Clapperboard,
  },
  "chess-knight": {
    displayName: "Chess",
    Icon: ChessKnight,
  },
  volleyball: {
    displayName: "Volleyball",
    Icon: Volleyball,
  },
  "heart-pulse": {
    displayName: "Health care",
    Icon: HeartPulse,
  },
  sparkles: {
    displayName: "Personal care",
    Icon: Sparkles,
  },
  "person-standing": {
    displayName: "Self",
    Icon: PersonStanding,
  },
  "user-round": {
    displayName: "User",
    Icon: UserRound,
  },
  "users-round": {
    displayName: "Group",
    Icon: UsersRound,
  },
  dumbbell: {
    displayName: "Fitness",
    Icon: Dumbbell,
  },
  baby: {
    displayName: "Kids",
    Icon: Baby,
  },
  "paw-print": {
    displayName: "Pets",
    Icon: PawPrint,
  },
  bone: {
    displayName: "Bone",
    Icon: Bone,
  },
  dog: {
    displayName: "Dog",
    Icon: Dog,
  },
  cat: {
    displayName: "Cat",
    Icon: Cat,
  },
  bird: {
    displayName: "Bird",
    Icon: Bird,
  },
  rat: {
    displayName: "Rat",
    Icon: Rat,
  },
  gift: {
    displayName: "Gift",
    Icon: Gift,
  },
  "book-open": {
    displayName: "Education",
    Icon: BookOpen,
  },
  "graduation-cap": {
    displayName: "Graduation",
    Icon: GraduationCap,
  },
  school: {
    displayName: "School",
    Icon: School,
  },
  landmark: {
    displayName: "Bank",
    Icon: Landmark,
  },
  briefcase: {
    displayName: "Work",
    Icon: Briefcase,
  },
  shield: {
    displayName: "Insurance",
    Icon: Shield,
  },
  hammer: {
    displayName: "Home improvement",
    Icon: Hammer,
  },
  wrench: {
    displayName: "Services",
    Icon: Wrench,
  },
  "arrow-down-left": {
    displayName: "Transfer in",
    Icon: ArrowDownLeft,
  },
  "arrow-up-right": {
    displayName: "Transfer out",
    Icon: ArrowUpRight,
  },
  help: {
    displayName: "Other",
    Icon: CircleHelp,
  },
};

export type CustomCategoryIconGroup = {
  displayName: string;
  icons: string[];
};

export const CUSTOM_CATEGORY_ICON_GROUPS = [
  {
    displayName: "Money",
    icons: [
      "wallet",
      "dollar-sign",
      "circle-dollar-sign",
      "piggy-bank",
      "gift",
      "hand-coins",
      "landmark",
      "shield",
      "arrow-down-left",
      "arrow-up-right",
    ],
  },
  {
    displayName: "Food & Drink",
    icons: [
      "utensils-crossed",
      "hamburger",
      "pizza",
      "beef",
      "drumstick",
      "fish",
      "leafy-green",
      "coffee",
      "cup-soda",
      "beer",
    ],
  },
  {
    displayName: "Travel",
    icons: ["car", "bus", "train", "plane", "helicopter", "fuel"],
  },
  {
    displayName: "Home",
    icons: ["home", "building", "hammer", "wrench"],
  },
  {
    displayName: "Shopping",
    icons: ["shopping-bag", "shopping-cart"],
  },
  {
    displayName: "Technology",
    icons: ["smart_phone", "laptop"],
  },
  {
    displayName: "Entertainment",
    icons: ["clapperboard", "chess-knight", "volleyball"],
  },
  {
    displayName: "Healthcare",
    icons: [
      "heart-pulse",
      "sparkles",
      "person-standing",
      "user-round",
      "users-round",
      "dumbbell",
    ],
  },
  {
    displayName: "Kids",
    icons: ["baby"],
  },
  {
    displayName: "Pets",
    icons: ["paw-print", "bone", "dog", "cat", "bird", "rat"],
  },
  {
    displayName: "Education",
    icons: ["book-open", "graduation-cap", "school"],
  },
  {
    displayName: "Work",
    icons: ["briefcase"],
  },
  {
    displayName: "Other",
    icons: ["tag", "help"],
  },
] satisfies CustomCategoryIconGroup[];

export const DEFAULT_CUSTOM_CATEGORY_ICON_META =
  CUSTOM_CATEGORY_ICON_METAS[DEFAULT_CUSTOM_CATEGORY_ICON];

export const CUSTOM_CATEGORY_ICONS = Object.keys(CUSTOM_CATEGORY_ICON_METAS);

export function getCustomCategoryIconMeta(
  iconName: string | null | undefined,
): CustomCategoryIconMeta {
  const normalized = iconName?.trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_CUSTOM_CATEGORY_ICON_META;
  }

  return (
    CUSTOM_CATEGORY_ICON_METAS[normalized] ?? DEFAULT_CUSTOM_CATEGORY_ICON_META
  );
}
