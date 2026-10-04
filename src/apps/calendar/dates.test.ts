import { expect, test } from "bun:test";
import { isoDate } from "../../lib/util";
import { byTime, mondayIndex, monthGrid, shiftMonth } from "./dates";

test("grid starts on the Monday on or before the 1st and spans 6 weeks", () => {
  const october = monthGrid(2026, 9); // 1 Oct 2026 is a Thursday
  expect(october).toHaveLength(42);
  expect(isoDate(october[0]!)).toBe("2026-09-28");
  expect(isoDate(october[3]!)).toBe("2026-10-01");
  expect(isoDate(october[41]!)).toBe("2026-11-08");
  expect(october.every(d => d.getHours() === 0)).toBe(true);
});

test("a month starting on Monday begins with its own 1st", () => {
  expect(isoDate(monthGrid(2024, 0)[0]!)).toBe("2024-01-01");
  expect(mondayIndex(new Date(2024, 0, 7))).toBe(6); // Sunday
});

test("shifting months wraps the year", () => {
  expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
  expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
});

test("all-day events sort before timed ones", () => {
  const events = [{ time: "14:00" }, { time: "" }, { time: "09:30" }];
  expect([...events].sort(byTime).map(e => e.time)).toEqual(["", "09:30", "14:00"]);
});
