import type { Transition } from "motion/react";

const cache = new Map<string, number>();

/** Numeric design token from tokens.css, so JS springs and CSS share one source. */
export function token(name: string): number {
  let value = cache.get(name);
  if (value === undefined) {
    value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    cache.set(name, value);
  }
  return value;
}

export const spring = (): Transition => ({
  type: "spring",
  stiffness: token("--spring-stiffness"),
  damping: token("--spring-damping"),
});
