import { useDrag } from "@use-gesture/react";
import { useState, type ReactNode } from "react";
import { useOS } from "../os/store";
import { cx, screenScale } from "../lib/util";
import s from "./AppFrame.module.css";
import { Glass } from "./Glass";
import { Icon, type IconName } from "./icons";

export type Tab = { id: string; label: string; icon: IconName };

type AppFrameProps = {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  trailing?: ReactNode;
  tabs?: Tab[];
  tab?: string;
  onTab?: (id: string) => void;
  /** Force the dark palette (Clock, Calculator, Camera...). */
  dark?: boolean;
  background?: string;
  footer?: ReactNode;
  children: ReactNode;
};

const BACK_SWIPE_PX = 90;

/** Standard app chrome: large-title nav bar, glass tab bar, footer slot and edge back-swipe. */
export function AppFrame(props: AppFrameProps) {
  const { title, onBack, backLabel, trailing, tabs, tab, onTab, dark, background, footer, children } = props;
  const systemDark = useOS(st => st.dark);
  const [scrolled, setScrolled] = useState(false);
  const isDark = dark ?? systemDark;

  const bindBack = useDrag(
    ({ movement: [mx], last, event }) => {
      if (last && mx / screenScale(event.target as Element) > BACK_SWIPE_PX) onBack?.();
    },
    { axis: "x", filterTaps: true },
  );

  return (
    <div
      className={s.frame}
      data-theme={isDark ? "dark" : undefined}
      data-tone={isDark ? "dark" : "light"}
      style={{ background }}
    >
      {(title || onBack || trailing) && (
        <header className={cx(s.nav, scrolled && s.navScrolled)}>
          {onBack ? (
            <Glass interactive shape="pill" className={s.back} onClick={onBack} aria-label={backLabel ?? "Geri"}>
              <Icon name="chevronLeft" size={20} />
              {backLabel && <span>{backLabel}</span>}
            </Glass>
          ) : (
            <span />
          )}
          <span className={s.inlineTitle}>{title}</span>
          <div className={s.trailing}>{trailing}</div>
        </header>
      )}
      <main
        className={cx(s.content, tabs && s.withTabs, footer !== undefined && s.withFooter)}
        onScroll={e => setScrolled(e.currentTarget.scrollTop > 36)}
      >
        {title && <h1 className={s.largeTitle}>{title}</h1>}
        {children}
      </main>
      {footer !== undefined && <div className={s.footer}>{footer}</div>}
      {tabs && (
        <Glass shape="pill" className={s.tabBar} role="tablist">
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === tab}
              className={cx(s.tab, t.id === tab && s.tabActive)}
              onClick={() => onTab?.(t.id)}
            >
              <Icon name={t.icon} size={22} />
              <span>{t.label}</span>
            </button>
          ))}
        </Glass>
      )}
      {onBack && <div className={s.backEdge} {...bindBack()} />}
    </div>
  );
}
