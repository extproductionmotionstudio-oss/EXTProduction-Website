"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Founder() {
  return (
    <section id="about" className="founder-section">
      <div className="founder-container">

        {/* Big Bold Section Title */}
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '36px', textAlign: 'center' }}
        >
          About Us
        </motion.h2>

        {/* Animated Avatar Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.06, rotate: 2 }}
          className="founder-logo-circle"
        >
          <img
            src="/logo.jpg"
            alt="EXT Production Logo"
            className="founder-logo-img"
          />
        </motion.div>

        {/* Paragraph 1 with blur reveal */}
        <motion.p
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="founder-text founder-text-primary"
        >
          EXTProduction is a leading motion design studio working with startups, SaaS, AI, and fintech companies. From product demos and launch videos to ads, explainers, and keynotes, we handle the entire process, from the first idea to the final frame.
        </motion.p>

        {/* Paragraph 2 with blur reveal */}
        <motion.p
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="founder-text founder-text-secondary"
        >
          We help you get the right audience discover your product, understand how it works, and convert into customers.
        </motion.p>
      </div>
    </section>
  );
}
