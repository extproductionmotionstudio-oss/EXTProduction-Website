"use client";

import { ReactLenis } from '@studio-freight/react-lenis';

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 2, smoothTouch: false }}>
      {children}
    </ReactLenis>
  );
}
