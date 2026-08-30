"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    { 
      q: 'What types of videos do you create?', 
      a: 'Product demos, launch videos, ads, product explainers, keynotes.' 
    },
    { 
      q: 'How do you learn about our product/ service?', 
      a: 'We start with an onboarding call to understand your product, target audience, key features, and video goals. We then set up a dedicated Google Drive for screen recordings, brand assets, logos, references, and project files. If needed, we’ll also get demo access to your product so our team can understand it inside and out.' 
    },
    { 
      q: 'How much does a video cost?', 
      a: 'Our videos start at $1000, with projects typically ranging up to $10,000+, depending on the video’s complexity, style, and duration. We take 50% upfront and 50% upon final delivery.' 
    },
    { 
      q: 'How long does a video take?', 
      a: 'Once the storyboard is approved, animation typically takes 8-10 business days. More complex projects may require additional time.' 
    },
    { 
      q: 'Do you offer monthly packages?', 
      a: 'Yes. We offer monthly retainers for brands that need ongoing video production, including product demos, feature launches, ad creatives, explainers, and other marketing content.',
      extra: 'Looking for ongoing creative support? Let’s discuss a retainer tailored to your needs. Schedule a call below.',
      cta: { text: 'Book a call', link: '/start-project' }
    }
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div>
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Your questions<br/>answered.
        </motion.h2>

        <div className="faq-accordion">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div 
                key={index} 
                className={`faq-item ${isOpen ? 'active' : ''}`}
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <button 
                  className="faq-question" 
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <motion.span 
                    className="faq-icon-wrapper"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 24 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </motion.span>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                      animate={{ 
                        height: "auto", 
                        opacity: 1,
                        transitionEnd: { overflow: "visible" },
                        transition: {
                          height: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.28, delay: 0.05, ease: "easeOut" }
                        }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        overflow: "hidden",
                        transition: {
                          height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.18 }
                        }
                      }}
                    >
                      <div className="faq-answer-inner" style={{ paddingBottom: '36px', paddingTop: '4px', overflow: 'visible' }}>
                        <p>{faq.a}</p>
                        {faq.extra && (
                          <p style={{ marginTop: '14px' }}>{faq.extra}</p>
                        )}
                        {faq.cta && (
                          <div style={{ paddingTop: '22px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', marginLeft: '-20px', overflow: 'visible' }}>
                            <motion.div 
                              whileHover={{ scale: 1.03, y: -2 }} 
                              whileTap={{ scale: 0.97 }} 
                              style={{ display: 'inline-block' }}
                            >
                              <Link 
                                href={faq.cta.link} 
                                className="cta-button primary-cta" 
                                style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'inline-flex' }}
                              >
                                {faq.cta.text}
                              </Link>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <motion.div 
          className="contact-card"
          initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="client-avatar" style={{ margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>👋</div>
          <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>Still have questions?</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '15px 0 25px', lineHeight: '1.6' }}>We're here to help you understand how motion design can elevate your product.</p>
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link href="/start-project" className="cta-button primary-cta">Book a call</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
