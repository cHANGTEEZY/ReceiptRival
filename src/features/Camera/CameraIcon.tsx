import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { ICON_STROKE } from "./constants";

export function CameraIcon({
  icon,
  size,
  color,
}: {
  icon: IconSvgElement;
  size: number;
  color: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={ICON_STROKE}
    />
  );
}
