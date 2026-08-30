"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'work', label: 'Our work', href: '#work' },
  { id: 'process', label: 'Our Process', href: '#process' },
  { id: 'testimonials', label: 'Testimonials', href: '#testimonials' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [clickedTab, setClickedTab] = useState(null);
  const isClickScrolling = useRef(false);
  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ScrollSpy to track active section during scroll
  useEffect(() => {
    const handleScrollSpy = () => {
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY + 200;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveTab(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const handleScrollClick = (e, targetHref, id) => {
    setIsMobileMenuOpen(false);
    setActiveTab(id);
    setClickedTab(id);

    // Reset clicked ripple trigger after animation
    setTimeout(() => {
      setClickedTab(null);
    }, 600);

    const hash = targetHref.includes('#') ? `#${targetHref.split('#')[1]}` : targetHref;
    const targetElement = document.querySelector(hash);

    if (targetElement) {
      e.preventDefault();
      // Prevent scrollspy override while smooth scrolling completes
      isClickScrolling.current = true;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        isClickScrolling.current = false;
      }, 1000);

      const navOffset = 90;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // If on another page (e.g. /start-project), redirect to home page section
      window.location.href = `/${hash}`;
    }
  };

  return (
    <nav className={`navbar glass ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link 
          href="/" 
          className="logo"
          onClick={(e) => {
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <img src="/logo.jpg" alt="EXTProduction Logo" />
          <span className="brand-name">EXTProduction</span>
        </Link>
        
        {/* Desktop Interactive Navigation Bar */}
        <div 
          className="nav-links"
          onMouseLeave={() => setHoveredTab(null)}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;
            const isClicked = clickedTab === item.id;

            return (
              <motion.a
                key={item.id}
                href={item.href}
                onClick={(e) => handleScrollClick(e, item.href, item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                className={`nav-link-item ${isActive ? 'active' : ''}`}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              >
                {/* Active Sliding Glass Capsule */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="nav-active-pill"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                {/* Hover Pill Preview */}
                {isHovered && !isActive && (
                  <motion.span
                    layoutId="navbar-hover-pill"
                    className="nav-hover-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}

                {/* Tactile Click Burst Ripple */}
                {isClicked && (
                  <motion.span
                    className="nav-click-burst"
                    initial={{ scale: 0.3, opacity: 0.9 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}

                <span className="nav-link-text">{item.label}</span>
              </motion.a>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Desktop CTA Button */}
          <motion.div
            className="desktop-cta-wrapper"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Link href="/start-project" className="cta-button primary-cta nav-cta">
              Start Your project
            </Link>
          </motion.div>
          
          {/* Interactive Morphing Menu Button - Mobile Only */}
          <motion.button 
            className="hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.85 }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              background: isMobileMenuOpen ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              padding: 0
            }}
          >
            <div style={{ width: '20px', height: '14px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 6 : 0,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                style={{ width: '100%', height: '2px', backgroundColor: '#0f172a', borderRadius: '2px', display: 'block', transformOrigin: 'center' }}
              />
              <motion.span
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  scaleX: isMobileMenuOpen ? 0 : 1,
                }}
                transition={{ duration: 0.15 }}
                style={{ width: '100%', height: '2px', backgroundColor: '#0f172a', borderRadius: '2px', display: 'block' }}
              />
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -6 : 0,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                style={{ width: '100%', height: '2px', backgroundColor: '#0f172a', borderRadius: '2px', display: 'block', transformOrigin: 'center' }}
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Dropdown Menu with Spring Physics & Staggered Reveal */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu open"
            initial={{ opacity: 0, y: -16, scale: 0.94, filter: 'blur(8px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              filter: 'blur(0px)',
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 28,
                staggerChildren: 0.05,
                delayChildren: 0.04
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -12, 
              scale: 0.95,
              filter: 'blur(6px)',
              transition: { duration: 0.18, ease: "easeOut" }
            }}
          >
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeTab === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    filter: 'blur(0px)',
                    transition: { type: "spring", stiffness: 450, damping: 26, delay: idx * 0.04 }
                  }}
                >
                  <motion.a
                    href={item.href}
                    onClick={(e) => handleScrollClick(e, item.href, item.id)}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {item.label}
                  </motion.a>
                </motion.div>
              );
            })}

            {/* Start Your Project CTA inside Mobile Menu */}
            <motion.div 
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                filter: 'blur(0px)',
                transition: { type: "spring", stiffness: 450, damping: 26, delay: 0.2 }
              }}
              style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Link 
                  href="/start-project" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="cta-button primary-cta" 
                  style={{ width: '100%', padding: '13px 20px', fontSize: '0.98rem', fontWeight: 600, justifyContent: 'center' }}
                >
                  Start Your project
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
