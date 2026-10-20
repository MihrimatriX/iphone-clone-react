import type { ReactNode } from "react";
import { cx } from "../lib/util";
import { Icon, type IconName } from "./icons";
import s from "./List.module.css";

/** iOS inset-grouped section. */
export function Section({ header, footer, children }: { header?: string; footer?: string; children: ReactNode }) {
  return (
    <section className={s.section}>
      {header && <h2 className={s.header}>{header}</h2>}
      <div className={s.group}>{children}</div>
      {footer && <p className={s.footer}>{footer}</p>}
    </section>
  );
}

type RowProps = {
  label: ReactNode;
  icon?: IconName;
  iconColor?: string;
  detail?: ReactNode;
  sub?: ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  onClick?: () => void;
  /** Trailing control (Toggle, button...). */
  children?: ReactNode;
};

export function Row({ label, icon, iconColor, detail, sub, chevron, destructive, onClick, children }: RowProps) {
  const body = (
    <>
      {icon && (
        <span className={s.icon} style={{ background: iconColor ?? "var(--gray)" }}>
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className={s.text}>
        <span className={cx(s.label, destructive && s.destructive)}>{label}</span>
        {sub && <span className={s.sub}>{sub}</span>}
      </span>
      {detail !== undefined && <span className={s.detail}>{detail}</span>}
      {children}
      {chevron && <Icon name="chevronRight" size={16} className={s.chevron} />}
    </>
  );
  return onClick ? (
    <button className={cx(s.row, s.tappable)} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={s.row}>{body}</div>
  );
}
