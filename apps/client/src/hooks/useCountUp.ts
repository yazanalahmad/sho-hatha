import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 800) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const start = performance.now();
    const from = fromRef.current;
    const delta = target - from;

    if (delta === 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(from + delta * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
