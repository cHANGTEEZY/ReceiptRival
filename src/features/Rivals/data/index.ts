import type { IconSvgElement } from "@hugeicons/react-native";
import {
  Delete04Icon,
  File02Icon,
  Fire02Icon,
} from "@hugeicons/core-free-icons";

export type RivalAction = {
  id: string;
  title: string;
  description: string;
  icon: IconSvgElement;
  cardClassName: string;
  titleClassName: string;
  subtitleClassName: string;
  iconColor: readonly [string, string];
};

const CARD_BASE =
  "rounded-none border-0 shadow-none bg-background-secondary border-b border-border";

const TITLE_DEFAULT = "text-base font-semibold text-foreground";
const SUBTITLE_DEFAULT = "mt-0.5 text-sm text-foreground/80";
const ICON_DEFAULT = ["#171717", "#fafafa"] as const;

const REMOVE_RIVAL_CARD =
  "rounded-none border-0 shadow-none bg-red-500/12 dark:bg-red-950/55 border-red-500/30";
const REMOVE_RIVAL_TITLE = "text-base font-semibold text-red-900 dark:text-red-100";
const REMOVE_RIVAL_SUBTITLE =
  "mt-0.5 text-sm text-red-800/90 dark:text-red-200/85";
const REMOVE_RIVAL_ICON = ["#991b1b", "#fecaca"] as const;

export const RIVAL_ACTIONS: RivalAction[] = [
  {
    id: "roast-via-notification",
    title: "Roast via Notification",
    description: "Deploy a digital ego-bruiser",
    icon: Fire02Icon,
    cardClassName: CARD_BASE,
    titleClassName: TITLE_DEFAULT,
    subtitleClassName: SUBTITLE_DEFAULT,
    iconColor: ICON_DEFAULT,
  },
  {
    id: "export-debt-history",
    title: "Export Debt History",
    description: "Export your debt history to a CSV file",
    icon: File02Icon,
    cardClassName: CARD_BASE,
    titleClassName: TITLE_DEFAULT,
    subtitleClassName: SUBTITLE_DEFAULT,
    iconColor: ICON_DEFAULT,
  },
  {
    id: "remove-rival",
    title: "Block rival",
    description: "Remove them from your list",
    icon: Delete04Icon,
    cardClassName: REMOVE_RIVAL_CARD,
    titleClassName: REMOVE_RIVAL_TITLE,
    subtitleClassName: REMOVE_RIVAL_SUBTITLE,
    iconColor: REMOVE_RIVAL_ICON,
  },
];
