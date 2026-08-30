"use client";

import { motion } from 'framer-motion';

export default function TrustedBy() {
  const companies = [
    'Autowrap', 'Superprofile', 'Higgsfield', 'Krevo AI', 'Qlero', 
    'FX Buddy', 'Bynn Intelligence inc', 'Hutsy', 'Detector24', 
    'Blackbox AI', 'ClinicEvo'
  ];

  return (
    <section className="trusted-by">
      <motion.p 
        className="trusted-label"
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        Trusted by innovative companies
      </motion.p>
      <motion.div 
        className="marquee-container"
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="marquee">
          {companies.map((c, i) => <span key={`c1-${i}`}>{c}</span>)}
          {/* Duplicate for infinite scroll */}
          {companies.map((c, i) => <span key={`c2-${i}`}>{c}</span>)}
        </div>
      </motion.div>
    </section>
  );
}
