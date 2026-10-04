/** Pure gesture decisions, kept out of the UI so they can be unit tested. Units: logical px and px/ms. */

export const SWIPE = {
  /** Upward travel before a bottom swipe counts at all. */
  minUp: 60,
  /** Upward speed that makes it a flick to Home rather than a pause for the switcher. */
  flick: 0.45,
  /** A slow swipe this far up opens the App Switcher. */
  switcherMin: 130,
  /** Sideways travel along the bottom edge that switches to the previous app. */
  sideMin: 70,
  sideMaxDy: 40,
  /** Home screen page drag needed to change page. */
  pageMin: 80,
  /** Pull-down distance for the top edges. */
  edgeOpen: 50,
  /** App Switcher card: throw distance, or a shorter throw with this speed. */
  dismissDy: 150,
  dismissFlickDy: 40,
  dismissFlick: 0.5,
};

export type BottomSwipe = "home" | "switcher" | "prevApp" | null;

/** dx/dy: release offset (dy < 0 is up). vy: signed vertical velocity (negative is up). */
export function classifyBottomSwipe(dx: number, dy: number, vy: number): BottomSwipe {
  if (Math.abs(dx) > SWIPE.sideMin && Math.abs(dy) < SWIPE.sideMaxDy) return "prevApp";
  if (-dy < SWIPE.minUp) return null;
  const flicked = -vy > SWIPE.flick;
  return !flicked && -dy > SWIPE.switcherMin ? "switcher" : "home";
}

/** Top edge pull: left half opens notifications, right half Control Center. */
export function classifyTopSwipe(startX: number, dy: number, width: number): "notifications" | "control" | null {
  if (dy < SWIPE.edgeOpen) return null;
  return startX < width / 2 ? "notifications" : "control";
}

/** Thrown-up App Switcher card closes the app. */
export function shouldDismissCard(dy: number, vy: number): boolean {
  return dy < -SWIPE.dismissDy || (dy < -SWIPE.dismissFlickDy && vy < -SWIPE.dismissFlick);
}

/** Home screen page after a horizontal drag. vx is the (unsigned) release speed. */
export function pageAfterSwipe(page: number, offset: number, vx: number, count: number): number {
  let delta = 0;
  if (offset < -SWIPE.pageMin || (offset < 0 && vx > SWIPE.flick)) delta = 1;
  if (offset > SWIPE.pageMin || (offset > 0 && vx > SWIPE.flick)) delta = -1;
  return Math.min(count - 1, Math.max(0, page + delta));
}
