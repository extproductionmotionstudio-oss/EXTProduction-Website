"use client";

import Link from 'next/link';
import Ipad3D from './Ipad3D';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const ROTATING_WORDS = ["SaaS.", "AI.", "Fintech."];

const wordUpBlurVariants = {
  hidden: {
    y: 26,
    opacity: 0,
    filter: 'blur(12px)',
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    y: -22,
    opacity: 0,
    filter: 'blur(10px)',
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Hero({ onOpenModal }) {
  const [wordIndex, setWordIndex] = useState(0);

  // Automatically cycle word: SaaS. -> AI. -> Fintech. every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleViewWorkClick = (e) => {
    e.preventDefault();
    const workSection = document.getElementById('work');
    if (workSection) {
      const navOffset = 90;
      const elementPosition = workSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        {/* Main Headline with 2 structured, perfectly aligned lines */}
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero-title-line">Premium Motion</span>
          <span className="hero-title-line hero-title-line-accent">
            <span className="for-text">Films For</span>
            <span className="rotating-word-container">
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  variants={wordUpBlurVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="rotating-word"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.h1>

        {/* Clean, left-aligned original description */}
        <motion.p 
          className="hero-description"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
           We create high-converting motion films that make your products easy to understand, hard to ignore, and built to sell.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link href="/start-project" className="cta-button primary-cta hero-btn">
              Book your project
            </Link>
          </motion.div>
          
          <motion.a 
            href="#work"
            whileHover={{ scale: 1.04, y: -2 }} 
            whileTap={{ scale: 0.96 }} 
            className="cta-button secondary-cta hero-btn" 
            onClick={handleViewWorkClick}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            View our work
          </motion.a>
        </motion.div>
      </div>

      {/* Right column 3D Visual */}
      <motion.div 
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.3, delay: 0.25 }}
      >
        <Ipad3D />

        {/* Laurel Wreath Award Badge Centered at Bottom of iPad Area */}
        <div className="ipad-award-badge">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <img 
              src="/project.png" 
              alt="# featured Project this month" 
              className="award-badge-img"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
