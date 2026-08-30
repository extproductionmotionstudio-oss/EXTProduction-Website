"use client";

import { motion } from 'framer-motion';
import MacNotch from './MacNotch';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: 'Amazing video. Thank you. No changes required, it’s perfect.',
      name: 'John Cavebring',
      role: 'Bynn Intelligence',
      image: '/bynn.png'
    },
    {
      id: 2,
      quote: 'Video’s unreal bro. Appreciate it. I’ll let you know about future projects.',
      name: 'Brody Hunt',
      role: 'Autowrap',
      image: '/AM.jpeg'
    },
    {
      id: 3,
      quote: 'We really liked it. Good fucking work.',
      name: 'Emil',
      role: 'Qlero',
      image: '/qlero-s.png'
    },
    {
      id: 4,
      quote: 'Yeah the video looks great!',
      name: 'Lucas',
      role: 'Detector24',
      image: '/Detector24-ai.png'
    },
    {
      id: 5,
      quote: 'The animated SaaS product ad was delivered with exceptional clarity, creativity, and attention to detail. Communication was smooth, the timelines were respected, and the final video exceeded expectations. I\'ll recommend you to my fellows for high-quality animation and product storytelling. Thank you so much.',
      name: 'Talha',
      role: 'Maxterz',
      image: '/maxterz.jpeg'
    }
  ];

  return (
    <section id="testimonials" className="testimonials-section">
      <MacNotch />

      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        What our clients<br />think of us
      </motion.h2>

      <div className="testimonials-grid" style={{ marginTop: '50px' }}>
        {testimonials.map((t, index) => (
          <motion.div
            key={t.id}
            className="testimonial-card"
            initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="quote">"{t.quote}"</p>
            <div className="client-info">
              <div className="client-avatar">
                {t.image ? (
                  <img src={t.image} alt={t.name} className="client-avatar-img" />
                ) : (
                  <span className="client-avatar-initials">
                    {t.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ lineHeight: '1.2' }}>{t.name}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
