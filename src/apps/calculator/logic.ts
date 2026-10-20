/** iOS calculator as a pure reducer: operator precedence, chaining, repeat "=", AC/C, ± and %. */

export type Op = "+" | "-" | "×" | "÷";
export type Key = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "." | "±" | "%" | "clear" | "=" | "⌫" | Op;

export type CalcState = {
  /** Machine-format number string being typed or shown ("12.5", "-0"). */
  entry: string;
  /** Pending terms: [n, op, n, op ...]; always ends with an operator when not empty. */
  stack: (number | Op)[];
  typing: boolean;
  /** Last operation, replayed by repeated "=". */
  repeat: { op: Op; arg: number } | null;
  error: boolean;
};

export const initial: CalcState = { entry: "0", stack: [], typing: false, repeat: null, error: false };

const MAX_DIGITS = 9;
const PRECEDENCE: Record<Op, number> = { "+": 1, "-": 1, "×": 2, "÷": 2 };
const isOp = (key: Key): key is Op => key in PRECEDENCE;

function apply(a: number, op: Op, b: number): number {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "×") return a * b;
  return b === 0 ? NaN : a / b;
}

/** Collapses trailing terms whose operator binds at least as tightly as `minPrecedence`. */
function reduce(terms: (number | Op)[], minPrecedence: number): (number | Op)[] {
  const out = [...terms];
  while (out.length >= 3) {
    const [a, op, b] = out.slice(-3) as [number, Op, number];
    if (PRECEDENCE[op] < minPrecedence) break;
    out.splice(-3, 3, apply(a, op, b));
  }
  return out;
}

/** Number -> entry string with at most 9 significant digits. */
function toEntry(n: number): string {
  if (Math.abs(n) >= 10 ** MAX_DIGITS) return n.toExponential(5).replace(/\.?0+e/, "e");
  return String(parseFloat(n.toPrecision(MAX_DIGITS)));
}

const value = (s: CalcState) => parseFloat(s.entry);
const result = (s: CalcState, n: number, patch: Partial<CalcState> = {}): CalcState =>
  Number.isFinite(n) ? { ...s, entry: toEntry(n), typing: false, ...patch } : { ...initial, error: true };

function typeDigit(s: CalcState, key: Key): CalcState {
  if (!s.typing) return { ...s, entry: key === "." ? "0." : key, typing: true };
  if (key === "." && s.entry.includes(".")) return s;
  if (s.entry.replace(/[-.]/g, "").length >= MAX_DIGITS) return s;
  if (key !== "." && (s.entry === "0" || s.entry === "-0")) return { ...s, entry: s.entry.replace("0", key) };
  return { ...s, entry: s.entry + key };
}

function pressOp(s: CalcState, op: Op): CalcState {
  const last = s.stack[s.stack.length - 1];
  if (!s.typing && last !== undefined && typeof last !== "number") return { ...s, stack: [...s.stack.slice(0, -1), op] };
  const reduced = reduce([...s.stack, value(s)], PRECEDENCE[op]);
  return result(s, reduced[reduced.length - 1] as number, { stack: [...reduced, op] });
}

function pressEquals(s: CalcState): CalcState {
  const last = s.stack[s.stack.length - 1];
  if (last === undefined || typeof last === "number") {
    return s.repeat ? result(s, apply(value(s), s.repeat.op, s.repeat.arg)) : { ...s, typing: false };
  }
  const total = reduce([...s.stack, value(s)], 0)[0] as number;
  return result(s, total, { stack: [], repeat: { op: last, arg: value(s) } });
}

function pressPercent(s: CalcState): CalcState {
  const last = s.stack[s.stack.length - 1];
  const left = s.stack[s.stack.length - 2];
  // iOS: "50 + 10 %" means 10% of 50; after × or ÷ it is just 10 / 100.
  if ((last === "+" || last === "-") && typeof left === "number") return result(s, (left * value(s)) / 100);
  return result(s, value(s) / 100);
}

function pressSign(s: CalcState): CalcState {
  const last = s.stack[s.stack.length - 1];
  if (!s.typing && last !== undefined && typeof last !== "number") return { ...s, entry: "-0", typing: true };
  return { ...s, entry: s.entry.startsWith("-") ? s.entry.slice(1) : `-${s.entry}` };
}

export function press(state: CalcState, key: Key): CalcState {
  const s = state.error ? initial : state;
  if (key === "clear") return clearLabel(state) === "AC" ? initial : { ...s, entry: "0", typing: false };
  if (key === "⌫") return s.typing ? { ...s, entry: s.entry.slice(0, -1).replace(/^-?$/, "0") } : s;
  if (key === "=") return pressEquals(s);
  if (key === "%") return pressPercent(s);
  if (key === "±") return pressSign(s);
  if (isOp(key)) return pressOp(s, key);
  return typeDigit(s, key);
}

/** "C" clears just the entry while something is typed; otherwise "AC" clears everything. */
export const clearLabel = (s: CalcState): "AC" | "C" =>
  s.error || (s.typing && s.entry !== "0" && s.entry !== "-0") ? "C" : "AC";

/** Operator button to highlight: the pending one, until the next digit. */
export function activeOp(s: CalcState): Op | null {
  const last = s.stack[s.stack.length - 1];
  return !s.typing && last !== undefined && typeof last !== "number" ? last : null;
}

/** Turkish display format: "1.234.567,89"; exponent as "1,2e10". */
export function display(s: CalcState): string {
  if (s.error) return "Hata";
  const [mantissa = "0", exponent] = s.entry.split("e");
  const negative = mantissa.startsWith("-");
  const [int = "0", frac] = mantissa.replace("-", "").split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const text = `${negative ? "-" : ""}${grouped}${frac !== undefined ? `,${frac}` : ""}`;
  return exponent ? `${text}e${exponent.replace("+", "")}` : text;
}
