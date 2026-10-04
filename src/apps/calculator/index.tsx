import { useDrag } from "@use-gesture/react";
import { useReducer } from "react";
import { haptic } from "../../lib/haptics";
import { cx } from "../../lib/util";
import { AppFrame } from "../../ui/AppFrame";
import { activeOp, clearLabel, display, initial, press, type Key } from "./logic";
import s from "./Calculator.module.css";

type Pad = { key: Key; label?: string; kind: "fn" | "num" | "op"; wide?: boolean; aria?: string };

const PAD: Pad[] = [
  { key: "clear", kind: "fn" }, { key: "±", kind: "fn", aria: "Artı eksi" }, { key: "%", kind: "fn", aria: "Yüzde" }, { key: "÷", kind: "op", aria: "Bölü" },
  { key: "7", kind: "num" }, { key: "8", kind: "num" }, { key: "9", kind: "num" }, { key: "×", kind: "op", aria: "Çarpı" },
  { key: "4", kind: "num" }, { key: "5", kind: "num" }, { key: "6", kind: "num" }, { key: "-", label: "−", kind: "op", aria: "Eksi" },
  { key: "1", kind: "num" }, { key: "2", kind: "num" }, { key: "3", kind: "num" }, { key: "+", kind: "op", aria: "Artı" },
  { key: "0", kind: "num", wide: true }, { key: ".", label: ",", kind: "num", aria: "Virgül" }, { key: "=", kind: "op", aria: "Eşittir" },
];

const CLEAR_ARIA = { AC: "Tümünü temizle", C: "Temizle" };

/** Digits shrink as the number grows so up to 9 digits fit on one line. */
const fontSize = (text: string) => Math.min(88, Math.floor(560 / Math.max(6.4, text.length)));

export default function Calculator() {
  const [state, dispatch] = useReducer(press, initial);
  const text = display(state);
  const pending = activeOp(state);
  const clear = clearLabel(state);

  // Swiping across the display deletes the last digit, like iOS.
  const bindSwipe = useDrag(
    ({ movement: [mx], last }) => {
      if (!last || Math.abs(mx) < 30) return;
      haptic("selection");
      dispatch("⌫");
    },
    { axis: "x", filterTaps: true },
  );

  return (
    <AppFrame dark background="#000">
      <div className={s.calc}>
        <output className={s.display} style={{ fontSize: fontSize(text) }} aria-live="polite" {...bindSwipe()}>
          {text}
        </output>
        <div className={s.pad}>
          {PAD.map(b => {
            const label = b.key === "clear" ? clear : (b.label ?? b.key);
            const aria = b.key === "clear" ? CLEAR_ARIA[clear] : (b.aria ?? label);
            return (
              <button
                key={b.key}
                className={cx(s.key, s[b.kind], b.wide && s.wide, pending === b.key && s.active)}
                aria-label={aria}
                aria-pressed={b.kind === "op" && b.key !== "=" ? pending === b.key : undefined}
                onClick={() => dispatch(b.key)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}
