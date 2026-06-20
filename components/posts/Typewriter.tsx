"use client";

import { useEffect, useState } from "react";

/**
 * Reveals text progressively (a streaming / typewriter effect). Reveals in small
 * chunks so the total animation finishes in a roughly fixed time regardless of
 * length, with a blinking cursor while typing.
 */
export default function Typewriter({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    const step = Math.max(1, Math.round(text.length / 200)); // ~200 ticks total
    let i = 0;
    const id = setInterval(() => {
      i += step;
      if (i >= text.length) {
        setCount(text.length);
        clearInterval(id);
      } else {
        setCount(i);
      }
    }, 18);
    return () => clearInterval(id);
  }, [text]);

  const done = count >= text.length;

  return (
    <p className={className}>
      {text.slice(0, count)}
      {!done && <span className="animate-pulse text-linkedin">▌</span>}
    </p>
  );
}
