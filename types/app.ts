import type { LucideIcon } from "lucide-react";

export type Route = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Marks a nav entry as not yet functional, so the UI can say so up front. */
  comingSoon?: boolean;
};
