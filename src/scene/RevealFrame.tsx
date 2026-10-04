import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Suspense fallback for frameloop="demand": nothing redraws when models finish loading. The fallback is
 * removed in the very commit that reveals them, so its cleanup is the moment to ask for that first frame.
 */
export function RevealFrame({ onReveal }: { onReveal?: () => void }) {
  const invalidate = useThree(s => s.invalidate);
  useEffect(
    () => () => {
      onReveal?.();
      invalidate();
    },
    [invalidate, onReveal],
  );
  return null;
}
