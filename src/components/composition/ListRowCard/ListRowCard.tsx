import React, {
  Children,
  createContext,
  isValidElement,
  useContext,
  type ComponentProps,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  View,
  type AccessibilityRole,
  type ImageSourcePropType,
  type ViewProps,
} from "react-native";
import { Avatar, Card, PressableFeedback } from "heroui-native";
import { twMerge } from "tailwind-merge";

export type ListRowCardVariant = "default" | "leaderboard" | "receipt";
export type ListRowCardFeedbackVariant =
  | "scale-highlight"
  | "scale-ripple"
  | "scale"
  | "none";

type HeroCardProps = ComponentProps<typeof Card>;
type HeroCardTitleProps = ComponentProps<typeof Card.Title>;
type HeroCardDescriptionProps = ComponentProps<typeof Card.Description>;

type ListRowCardSlotProps = PropsWithChildren<{
  className?: string;
}>;

type HeroAvatarProps = ComponentProps<typeof Avatar>;

export type ListRowCardIconProps = PropsWithChildren<
  {
    className?: string;
    /** When set, renders `Avatar.Image` with automatic fallback to children. */
    source?: ImageSourcePropType;
    alt?: string;
  } & Pick<HeroAvatarProps, "size" | "variant" | "color" | "animation">
>;

type ListRowCardContextValue = {
  titleClassName: string;
  subtitleClassName: string;
  itemClassName: string;
};

export type ListRowCardProps = PropsWithChildren<
  {
    rowVariant?: ListRowCardVariant;
    bodyClassName?: string;
    iconClassName?: string;
    contentClassName?: string;
    trailingClassName?: string;
    onPress?: () => void;
    isPressable?: boolean;
    feedbackVariant?: ListRowCardFeedbackVariant;
    disabled?: boolean;
    accessibilityRole?: AccessibilityRole;
    accessibilityLabel?: string;
    accessibilityHint?: string;
  } & Omit<HeroCardProps, "children">
>;

export type ListRowCardItemProps = PropsWithChildren<ViewProps>;
export type ListRowCardTitleProps = PropsWithChildren<
  Omit<HeroCardTitleProps, "children">
>;
export type ListRowCardSubtitleProps = PropsWithChildren<
  Omit<HeroCardDescriptionProps, "children">
>;

type ListRowCardVariantStyles = {
  card: string;
  body: string;
  icon: string;
  content: string;
  trailing: string;
  title: string;
  subtitle: string;
  item: string;
};

const LIST_ROW_CARD_VARIANTS: Record<
  ListRowCardVariant,
  ListRowCardVariantStyles
> = {
  default: {
    card: "overflow-hidden rounded-[28px] border border-border bg-background-secondary",
    body: "flex-row items-center gap-4 px-4 py-4",
    icon: "shrink-0 items-center justify-center",
    content: "min-w-0 flex-1 justify-center",
    trailing: "shrink-0 items-end justify-center gap-1.5",
    title: "text-lg font-bold text-foreground",
    subtitle: "mt-1 text-sm text-muted-foreground",
    item: "items-end",
  },
  leaderboard: {
    card: "overflow-hidden rounded-[28px] border border-lime-400/15 bg-lime-950/55",
    body: "flex-row items-center gap-4 px-4 py-4",
    icon: "shrink-0 items-center justify-center",
    content: "min-w-0 flex-1 justify-center",
    trailing: "shrink-0 items-end justify-center gap-1",
    title: "text-xl font-bold leading-tight text-foreground",
    subtitle: "mt-1 text-base text-muted-foreground",
    item: "items-end",
  },
  receipt: {
    card: "overflow-hidden rounded-[28px] border border-border/80 bg-background-secondary",
    body: "flex-row items-center gap-3 px-4 py-3.5",
    icon: "shrink-0 items-center justify-center",
    content: "min-w-0 flex-1 justify-center",
    trailing: "shrink-0 items-end justify-center gap-1",
    title: "text-lg font-bold text-foreground",
    subtitle: "mt-0.5 text-sm text-muted-foreground",
    item: "items-end",
  },
};

const ListRowCardContext = createContext<ListRowCardContextValue>({
  titleClassName: LIST_ROW_CARD_VARIANTS.default.title,
  subtitleClassName: LIST_ROW_CARD_VARIANTS.default.subtitle,
  itemClassName: LIST_ROW_CARD_VARIANTS.default.item,
});

function cn(...values: Array<string | undefined | null | false>) {
  return twMerge(values.filter(Boolean).join(" "));
}

function ListRowCardIcon(_props: ListRowCardIconProps) {
  return null;
}
ListRowCardIcon.displayName = "ListRowCard.Icon";

function ListRowCardContent(_props: ListRowCardSlotProps) {
  return null;
}
ListRowCardContent.displayName = "ListRowCard.Content";

function ListRowCardTrailing(_props: ListRowCardSlotProps) {
  return null;
}
ListRowCardTrailing.displayName = "ListRowCard.Trailing";

function hasDisplayName(child: ReactElement, displayName: string) {
  return (
    typeof child.type !== "string" &&
    "displayName" in child.type &&
    (child.type as { displayName?: string }).displayName === displayName
  );
}

function isIconSlot(
  child: ReactElement,
): child is ReactElement<ListRowCardIconProps> {
  return (
    child.type === ListRowCardIcon || hasDisplayName(child, "ListRowCard.Icon")
  );
}

function isContentSlot(
  child: ReactElement,
): child is ReactElement<ListRowCardSlotProps> {
  return (
    child.type === ListRowCardContent ||
    hasDisplayName(child, "ListRowCard.Content")
  );
}

function isTrailingSlot(
  child: ReactElement,
): child is ReactElement<ListRowCardSlotProps> {
  return (
    child.type === ListRowCardTrailing ||
    hasDisplayName(child, "ListRowCard.Trailing")
  );
}

function collectSlots(children: ReactNode) {
  let iconSlot: ReactElement<ListRowCardIconProps> | undefined;
  let contentSlot: ReactElement<ListRowCardSlotProps> | undefined;
  let trailingSlot: ReactElement<ListRowCardSlotProps> | undefined;
  const looseContent: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      if (child !== null && child !== undefined && child !== false) {
        looseContent.push(child);
      }
      return;
    }

    if (isIconSlot(child)) {
      iconSlot = child;
      return;
    }

    if (isContentSlot(child)) {
      contentSlot = child;
      return;
    }

    if (isTrailingSlot(child)) {
      trailingSlot = child;
      return;
    }

    looseContent.push(child);
  });

  return { iconSlot, contentSlot, trailingSlot, looseContent };
}

function ListRowCardIconAvatar({
  iconSlot,
  alignClassName,
}: {
  iconSlot: ReactElement<ListRowCardIconProps>;
  alignClassName: string;
}) {
  const {
    children: iconChildren,
    className: iconSlotClassName,
    source,
    alt,
    size = "lg",
    variant = "soft",
    color = "accent",
    animation,
  } = iconSlot.props;

  return (
    <View className={alignClassName}>
      <Avatar
        alt={alt ?? "Profile avatar"}
        size={size}
        variant={variant}
        color={color}
        animation={animation}
        className={iconSlotClassName}
      >
        {source ? <Avatar.Image source={source} /> : null}
        <Avatar.Fallback>{iconChildren}</Avatar.Fallback>
      </Avatar>
    </View>
  );
}

function renderFeedbackOverlay(feedbackVariant: ListRowCardFeedbackVariant) {
  switch (feedbackVariant) {
    case "scale-highlight":
      return <PressableFeedback.Highlight />;
    case "scale-ripple":
      return <PressableFeedback.Ripple />;
    default:
      return null;
  }
}

type ListRowCardRootComponent = React.FC<ListRowCardProps> & {
  Icon: typeof ListRowCardIcon;
  Content: typeof ListRowCardContent;
  Title: React.FC<ListRowCardTitleProps>;
  Subtitle: React.FC<ListRowCardSubtitleProps>;
  Trailing: typeof ListRowCardTrailing;
  Item: React.FC<ListRowCardItemProps>;
};

const ListRowCardRoot: React.FC<ListRowCardProps> = ({
  children,
  rowVariant = "default",
  bodyClassName,
  iconClassName,
  contentClassName,
  trailingClassName,
  onPress,
  isPressable,
  feedbackVariant = "scale-highlight",
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  className,
  ...cardProps
}) => {
  const variantStyles = LIST_ROW_CARD_VARIANTS[rowVariant];
  const { iconSlot, contentSlot, trailingSlot, looseContent } =
    collectSlots(children);

  const hasContent = Boolean(contentSlot) || looseContent.length > 0;
  const contentChildren = contentSlot ? (
    <>
      {contentSlot.props.children}
      {looseContent}
    </>
  ) : (
    looseContent
  );
  const interactive = Boolean(onPress) || isPressable;

  const card = (
    <Card {...cardProps} className={cn(variantStyles.card, className)}>
      {interactive ? renderFeedbackOverlay(feedbackVariant) : null}
      <Card.Body className={cn(variantStyles.body, bodyClassName)}>
        {iconSlot ? (
          <ListRowCardIconAvatar
            iconSlot={iconSlot}
            alignClassName={cn(variantStyles.icon, iconClassName)}
          />
        ) : null}

        {hasContent ? (
          <View
            className={cn(
              variantStyles.content,
              contentClassName,
              contentSlot?.props.className,
            )}
          >
            {contentChildren}
          </View>
        ) : null}

        {trailingSlot ? (
          <View
            className={cn(
              variantStyles.trailing,
              trailingClassName,
              trailingSlot.props.className,
            )}
          >
            {trailingSlot.props.children}
          </View>
        ) : null}
      </Card.Body>
    </Card>
  );

  const content = (
    <ListRowCardContext.Provider
      value={{
        titleClassName: variantStyles.title,
        subtitleClassName: variantStyles.subtitle,
        itemClassName: variantStyles.item,
      }}
    >
      {card}
    </ListRowCardContext.Provider>
  );

  if (!interactive) return content;

  return (
    <PressableFeedback
      onPress={onPress}
      isDisabled={disabled}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      animation={feedbackVariant === "none" ? "disable-all" : undefined}
    >
      {content}
    </PressableFeedback>
  );
};

function ListRowCardTitle({
  children,
  className,
  ...props
}: ListRowCardTitleProps) {
  const { titleClassName } = useContext(ListRowCardContext);

  return (
    <Card.Title {...props} className={cn(titleClassName, className)}>
      {children}
    </Card.Title>
  );
}

function ListRowCardSubtitle({
  children,
  className,
  ...props
}: ListRowCardSubtitleProps) {
  const { subtitleClassName } = useContext(ListRowCardContext);

  return (
    <Card.Description {...props} className={cn(subtitleClassName, className)}>
      {children}
    </Card.Description>
  );
}

function ListRowCardItem({
  children,
  className,
  ...props
}: ListRowCardItemProps) {
  const { itemClassName } = useContext(ListRowCardContext);

  return (
    <View {...props} className={cn(itemClassName, className)}>
      {children}
    </View>
  );
}

export const ListRowCard = ListRowCardRoot as ListRowCardRootComponent;

ListRowCard.Icon = ListRowCardIcon;
ListRowCard.Content = ListRowCardContent;
ListRowCard.Title = ListRowCardTitle;
ListRowCard.Subtitle = ListRowCardSubtitle;
ListRowCard.Trailing = ListRowCardTrailing;
ListRowCard.Item = ListRowCardItem;
