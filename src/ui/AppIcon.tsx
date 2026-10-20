import type { ComponentType } from "react";
import { Icon, type IconName } from "./icons";

type AppIconProps = {
  icon: IconName;
  accent: string;
  tint?: string;
  size?: number;
  /** Custom contents instead of the glyph (e.g. Calendar showing today's date). */
  Face?: ComponentType<{ size: number }>;
  badge?: number;
};

/** Rounded-square app icon: background is any CSS paint, glyph is an original icon. */
export function AppIcon({ icon, accent, tint = "#fff", size = 62, Face, badge = 0 }: AppIconProps) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: size * 0.225,
        background: accent,
        color: tint,
        display: "grid",
        placeItems: "center",
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,.25), 0 2px 6px rgba(0,0,0,.15)",
      }}
    >
      {Face ? <Face size={size} /> : <Icon name={icon} size={size * 0.56} />}
      {badge > 0 && (
        <span
          aria-label={`${badge} bildirim`}
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            minWidth: 21,
            height: 21,
            padding: "0 6px",
            boxSizing: "border-box",
            borderRadius: 11,
            background: "#ff3b30",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </div>
  );
}
