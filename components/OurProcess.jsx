"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MacNotch from './MacNotch';

export default function OurProcess() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef(false);

  const steps = [
    {
      num: '01',
      title: 'Onboarding',
      desc: 'After you submit your project, we get on an onboarding call to understand your product, ICP, where the video will be posted, what you want it to achieve, and the style you’re looking for.'
    },
    {
      num: '02',
      title: 'Collaborative Scripting',
      desc: 'Have a script? We’ll refine it.\nDon’t have one? We’ll write it from scratch based on your goals and what you’re trying to communicate.'
    },
    {
      num: '03',
      title: 'Storyboarding',
      desc: 'We storyboard the video frame by frame in Figma/Canva, with notes on what happens in each scene and how it will be animated. This gives you a clear idea of the video before we start animating.'
    },
    {
      num: '04',
      title: 'Animation & Sound Design',
      desc: 'Once the storyboard is approved, we bring it to life with animation, motion design, sound effects, and music.'
    },
    {
      num: '05',
      title: 'Post-Production',
      desc: 'We review the video, make the changes you want, and get it ready for delivery. You get 2 rounds of revisions included at no extra cost.'
    }
  ];

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const handleDotClick = (idx) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Pure GPU-accelerated variants (transform and opacity only - no heavy blur filters that lag mobile GPUs)
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 28 : -28,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 420, damping: 34 },
        opacity: { duration: 0.2, ease: "easeOut" }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -28 : 28,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 420, damping: 34 },
        opacity: { duration: 0.16, ease: "easeIn" }
      }
    })
  };

  // Native, lightweight touch handlers that NEVER block vertical page scrolling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e) => {
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isHorizontalSwipe.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (isHorizontalSwipe.current) {
      const diffX = e.changedTouches[0].clientX - touchStartX.current;
      if (diffX < -40) {
        handleNext();
      } else if (diffX > 40) {
        handlePrev();
      }
    }
    isHorizontalSwipe.current = false;
  };

  return (
    <section id="process" className="process-section">
      <div className="process-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          Our Process
        </motion.h2>
        
        <div 
          className="process-card-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="process-card-stage">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div 
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="process-card"
              >
                <MacNotch />
                <div className="process-num">{steps[currentIndex].num}</div>
                <h3 className="process-title">{steps[currentIndex].title}</h3>
                <p className="process-desc">{steps[currentIndex].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls in a permanently stable position */}
          <div className="process-controls">
            <button 
              onClick={handlePrev} 
              className="process-nav-btn"
              aria-label="Previous step"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="process-dots">
              {steps.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleDotClick(idx)} 
                  className={`process-dot ${idx === currentIndex ? 'active' : ''}`}
                  aria-label={`Go to step ${idx + 1}`}
                  type="button"
                />
              ))}
            </div>

            <button 
              onClick={handleNext} 
              className="process-nav-btn"
              aria-label="Next step"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
