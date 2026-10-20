import { expect, test } from "bun:test";
import { activeOp, clearLabel, display, initial, press, type CalcState, type Key } from "./logic";

/** Presses keys from a string; "c" = clear, "n" = ±, "b" = backspace, "*" and "/" = × and ÷. */
function run(keys: string, from: CalcState = initial): CalcState {
  const map: Record<string, Key> = { c: "clear", n: "±", b: "⌫", "*": "×", "/": "÷" };
  return [...keys].reduce((s, ch) => press(s, map[ch] ?? (ch as Key)), from);
}
const show = (keys: string) => display(run(keys));

test("operator precedence and chaining", () => {
  expect(show("2+3*4=")).toBe("14");
  expect(show("2+3*")).toBe("3");
  expect(show("2*3+")).toBe("6");
  expect(show("10-2-3=")).toBe("5");
  expect(show("8/4*2=")).toBe("4");
});

test("repeat equals and operand reuse", () => {
  expect(show("2+3==")).toBe("8");
  expect(show("2+3*4==")).toBe("56");
  expect(show("5+=")).toBe("10");
  expect(show("2+3=7")).toBe("7");
  expect(show("2+3=+1=")).toBe("6");
});

test("changing the operator before the next number", () => {
  expect(show("2+*3=")).toBe("6");
  expect(activeOp(run("2+"))).toBe("+");
  expect(activeOp(run("2+3"))).toBeNull();
});

test("percent like iOS", () => {
  expect(show("50+10%")).toBe("5");
  expect(show("50+10%=")).toBe("55");
  expect(show("50*10%=")).toBe("5");
  expect(show("25%")).toBe("0,25");
});

test("sign, decimals, digit limit, backspace", () => {
  expect(show("5n")).toBe("-5");
  expect(show("5+n3=")).toBe("2");
  expect(show(".5")).toBe("0,5");
  expect(show("1.2.3")).toBe("1,23");
  expect(show("1234567891")).toBe("123.456.789");
  expect(show("123b")).toBe("12");
  expect(show("1b")).toBe("0");
});

test("clear: C then AC", () => {
  const typed = run("5+3");
  expect(clearLabel(typed)).toBe("C");
  const cleared = press(typed, "clear");
  expect(display(cleared)).toBe("0");
  expect(clearLabel(cleared)).toBe("AC");
  expect(display(run("4=", cleared))).toBe("9");
  expect(press(cleared, "clear")).toEqual(initial);
});

test("errors and big numbers", () => {
  expect(show("8/0=")).toBe("Hata");
  expect(show("8/0=2")).toBe("2");
  expect(show("123456789*1000=")).toBe("1,23457e11");
  expect(show("999999999*9=")).toBe("9e9");
  expect(show("0.1+0.2=")).toBe("0,3");
});
