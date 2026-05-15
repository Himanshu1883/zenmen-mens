import { useCallback, useRef } from "react";

type UseSwipeSliderOptions = {
  onNext: () => void;
  onPrev: () => void;
  /** Minimum horizontal movement (px) to count as a swipe. */
  threshold?: number;
  enabled?: boolean;
};

/** Horizontal touch swipe for carousels; vertical scroll is preserved. */
export function useSwipeSlider({
  onNext,
  onPrev,
  threshold = 48,
  enabled = true,
}: UseSwipeSliderOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isTracking = useRef(false);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isTracking.current = true;
    },
    [enabled],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isTracking.current || e.touches.length !== 1) return;
      const dx = Math.abs(e.touches[0].clientX - startX.current);
      const dy = Math.abs(e.touches[0].clientY - startY.current);
      if (dy > dx && dy > 12) isTracking.current = false;
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isTracking.current) return;
      isTracking.current = false;
      const diff = startX.current - e.changedTouches[0].clientX;
      if (diff > threshold) onNext();
      else if (diff < -threshold) onPrev();
    },
    [enabled, threshold, onNext, onPrev],
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
