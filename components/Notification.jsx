"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_NOTIFICATION_TEXT = "2 slots left for current month";

export default function Notification() {
  const [show, setShow] = useState(false);
  const [badgeText, setBadgeText] = useState(DEFAULT_NOTIFICATION_TEXT);
  const [badgeVisible, setBadgeVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'notification'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.text !== undefined && data.text.trim() !== '') {
          setBadgeText(data.text);
        }
        if (data.enabled !== undefined) {
          setBadgeVisible(data.enabled);
        }
      }
    }, (err) => {
      console.warn("Could not load slot notification settings:", err);
    });

    return () => unsubscribe();
  }, []);

  if (!badgeVisible) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
          className="notification-wrapper"
        >
          <Link href="/start-project" className="notification-badge interactive-badge" aria-label={`Book your project - ${badgeText}`}>
            <span className="pulse"></span>
            <span className="badge-text">{badgeText}</span>
            <svg 
              className="badge-arrow" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
