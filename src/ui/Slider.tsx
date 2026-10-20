import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { haptic } from "../lib/haptics";
import { clamp, cx } from "../lib/util";
import { Icon, type IconName } from "./icons";
import s from "./Slider.module.css";

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  /** Control Center style: tall glass block that fills from the bottom. */
  vertical?: boolean;
  /** Glyph inside the vertical block. */
  icon?: IconName;
  /** Horizontal only: small glyph before the track, large one after it (iOS Settings). */
  ends?: [IconName, IconName];
  className?: string;
};

/** 0..1 slider for mouse, touch and keyboard. Like iOS, it ticks only when it hits either end. */
export function Slider({ value, onChange, label, vertical, icon, ends, className }: SliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const edge = useRef<number | null>(value === 0 || value === 1 ? value : null);

  const set = (next: number) => {
    const v = clamp(next, 0, 1);
    const atEdge = v === 0 || v === 1 ? v : null;
    if (atEdge !== null && atEdge !== edge.current) haptic("selection");
    edge.current = atEdge;
    onChange(v);
  };

  const fromPointer = (e: PointerEvent) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    set(vertical ? 1 - (e.clientY - rect.top) / rect.height : (e.clientX - rect.left) / rect.width);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const delta = { ArrowUp: 0.1, ArrowRight: 0.1, ArrowDown: -0.1, ArrowLeft: -0.1 }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    set(value + delta);
  };

  const percent = `${value * 100}%`;
  const slider = (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cx(s.slider, vertical ? s.vertical : s.horizontal, dragging && s.dragging, !ends && className)}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        fromPointer(e);
      }}
      onPointerMove={e => dragging && fromPointer(e)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={onKeyDown}
    >
      {vertical ? (
        <>
          <div ref={track} className={s.track} />
          <div className={s.fill} style={{ height: percent }} />
          {icon && <Icon name={icon} size={26} className={s.icon} />}
        </>
      ) : (
        <div ref={track} className={s.track}>
          <div className={s.fill} style={{ width: percent }} />
          <div className={s.knob} style={{ left: percent }} />
        </div>
      )}
    </div>
  );
  if (!ends) return slider;
  return (
    <div className={cx(s.withEnds, className)}>
      <Icon name={ends[0]} size={14} className={s.end} />
      {slider}
      <Icon name={ends[1]} size={22} className={s.end} />
    </div>
  );
}
