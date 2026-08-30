"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  // Fast inner dot
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Trailing outer ring
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  // Premium physics configuration
  const dotSpringConfig = { damping: 25, stiffness: 700, mass: 0.1 };
  const ringSpringConfig = { damping: 25, stiffness: 200, mass: 0.5 };

  const dotXSpring = useSpring(dotX, dotSpringConfig);
  const dotYSpring = useSpring(dotY, dotSpringConfig);
  const ringXSpring = useSpring(ringX, ringSpringConfig);
  const ringYSpring = useSpring(ringY, ringSpringConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      setIsHidden(false);
      dotX.set(e.clientX - 4); // center 8px dot
      dotY.set(e.clientY - 4);
      ringX.set(e.clientX - 16); // center 32px ring
      ringY.set(e.clientY - 16);
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    const handleMouseOver = (e) => {
      if (
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.closest('a') ||
        e.target.closest('button') ||
        e.target.classList.contains('video-card') ||
        e.target.classList.contains('swiper-slide')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [dotX, dotY, ringX, ringY]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x: dotXSpring, y: dotYSpring, opacity: isHidden ? 0 : 1 }}
        animate={{
          scale: isHovering ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: ringXSpring, y: ringYSpring, opacity: isHidden ? 0 : 1 }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(0, 0, 0, 0.06)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        
        .cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 8px;
          height: 8px;
          background-color: var(--accent-dark);
          border-radius: 50%;
          pointer-events: none;
          z-index: 2147483647;
        }

        .cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          border: 1.5px solid #000000;
          border-radius: 50%;
          pointer-events: none;
          z-index: 2147483646;
        }
        
        /* Dark mode compatibility if needed */
        @media (prefers-color-scheme: dark) {
          .cursor-dot { background-color: var(--accent-dark); }
          .cursor-ring { border-color: #000000; }
        }

        /* Hide it on mobile/touch devices for better UX */
        @media (max-width: 768px) {
          * { cursor: auto !important; }
          .cursor-dot, .cursor-ring { display: none !important; }
        }
      `}</style>
    </>
  );
}
