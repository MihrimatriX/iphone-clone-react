import { expect, test } from "bun:test";
import { classifyBottomSwipe, classifyTopSwipe, pageAfterSwipe, shouldDismissCard } from "./gestures";

test("bottom swipe: flick up goes home, slow long swipe opens switcher", () => {
  expect(classifyBottomSwipe(0, -200, -1.2)).toBe("home");
  expect(classifyBottomSwipe(0, -200, -0.1)).toBe("switcher");
  expect(classifyBottomSwipe(0, -90, -0.1)).toBe("home");
});

test("bottom swipe: too short or sideways", () => {
  expect(classifyBottomSwipe(0, -20, -2)).toBeNull();
  expect(classifyBottomSwipe(120, -10, 0)).toBe("prevApp");
  expect(classifyBottomSwipe(-120, 5, 0)).toBe("prevApp");
});

test("top swipe picks the half", () => {
  expect(classifyTopSwipe(50, 80, 390)).toBe("notifications");
  expect(classifyTopSwipe(340, 80, 390)).toBe("control");
  expect(classifyTopSwipe(340, 20, 390)).toBeNull();
});

test("card dismissal by distance or flick", () => {
  expect(shouldDismissCard(-200, 0)).toBe(true);
  expect(shouldDismissCard(-60, -1)).toBe(true);
  expect(shouldDismissCard(-60, -0.1)).toBe(false);
  expect(shouldDismissCard(30, -2)).toBe(false);
});

test("page swipe by distance or flick, clamped to the page count", () => {
  expect(pageAfterSwipe(0, -120, 0, 2)).toBe(1);
  expect(pageAfterSwipe(0, -20, 0.9, 2)).toBe(1);
  expect(pageAfterSwipe(0, -20, 0.1, 2)).toBe(0);
  expect(pageAfterSwipe(1, -200, 2, 2)).toBe(1);
  expect(pageAfterSwipe(1, 150, 0, 2)).toBe(0);
  expect(pageAfterSwipe(0, 150, 0, 2)).toBe(0);
});
