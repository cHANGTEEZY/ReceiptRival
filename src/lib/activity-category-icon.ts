import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type ActivityCategoryIonicon = ComponentProps<typeof Ionicons>["name"];

export function getActivityCategoryIcon(category: string): ActivityCategoryIonicon {
  const key = category.trim().toLowerCase();
  if (
    key === "food" ||
    key === "dinner" ||
    key === "lunch" ||
    key === "restaurant"
  ) {
    return "restaurant-outline";
  }
  if (key === "movie" || key === "movies" || key === "entertainment") {
    return "film-outline";
  }
  if (key === "coffee" || key === "drinks" || key === "bar") {
    return "cafe-outline";
  }
  if (key === "transport" || key === "travel" || key === "rideshare") {
    return "car-outline";
  }
  if (key === "shopping" || key === "retail" || key === "groceries") {
    return "bag-outline";
  }
  if (key === "gas" || key === "fuel") {
    return "color-fill-outline";
  }
  return "receipt-outline";
}
