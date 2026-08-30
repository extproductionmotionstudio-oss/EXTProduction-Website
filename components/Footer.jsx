"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer>
      <div className="footer-cta">
        <motion.h2
          initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Let’s Make Your<br />Product Stand Out.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
        >
          <Link href="/start-project" className="cta-button primary-cta footer-cta-btn">Book your project</Link>
        </motion.div>
      </div>

      <motion.div
        className="footer-content"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%' }}
      >
        <div className="footer-bottom">
          <div className="footer-logo">EXTProduction</div>
          <div className="footer-social-links">
            <a href="https://x.com/extproduction" target="_blank" rel="noopener noreferrer" className="footer-social-link">Twitter</a>
            <a href="https://www.youtube.com/@extproductionmotionstudio" target="_blank" rel="noopener noreferrer" className="footer-social-link">YouTube</a>
            <a href="https://www.instagram.com/madebyext/" target="_blank" rel="noopener noreferrer" className="footer-social-link">Instagram</a>
            <a href="https://www.linkedin.com/in/extproduction-motion-studio-6aa335361/" target="_blank" rel="noopener noreferrer" className="footer-social-link">LinkedIn</a>
          </div>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} EXTProduction. All rights reserved.</p>
        </div>
      </motion.div>
    </footer>
  );
}
