"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({ value, onChange, placeholder = "Select start date..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse initial date or default to today
  const parseValueToDate = (val) => {
    if (!val) return today;
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? today : parsed;
  };

  const [currentMonth, setCurrentMonth] = useState(() => parseValueToDate(value).getMonth());
  const [currentYear, setCurrentYear] = useState(() => parseValueToDate(value).getFullYear());

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(currentYear, currentMonth, d));
  }

  // Selected date comparison
  let selectedDate = null;
  if (value) {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      selectedDate = parsed;
      selectedDate.setHours(0, 0, 0, 0);
    }
  }

  const handleSelectDate = (date) => {
    if (!date || date < today) return;
    
    // Format e.g. "28 Aug 2026"
    const formatted = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="custom-datepicker-container" ref={containerRef}>
      <div 
        className={`custom-datepicker-input ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-label="Select start date"
      >
        <span className={value ? "datepicker-value" : "datepicker-placeholder"}>
          {value || placeholder}
        </span>
        <div className="datepicker-icon-wrapper">
          <svg className="datepicker-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="custom-datepicker-popup"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header: <  Month ∨  Year ∨  > */}
            <div className="datepicker-header">
              <button 
                type="button" 
                className="datepicker-nav-btn" 
                onClick={handlePrevMonth} 
                aria-label="Previous month"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              <div className="datepicker-month-year-group">
                <div className="datepicker-selector-label">
                  <span>{MONTH_NAMES[currentMonth]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                <div className="datepicker-selector-label">
                  <span>{currentYear}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>

              <button 
                type="button" 
                className="datepicker-nav-btn" 
                onClick={handleNextMonth} 
                aria-label="Next month"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Weekdays */}
            <div className="datepicker-weekdays">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="datepicker-weekday">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="datepicker-grid">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="datepicker-day empty"></div>;
                }

                const isPast = date < today;
                const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                const isToday = date.getTime() === today.getTime();

                let dayClass = "datepicker-day";
                if (isPast) dayClass += " disabled";
                if (isSelected) dayClass += " selected";
                if (isToday && !isSelected) dayClass += " today";

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={isPast}
                    className={dayClass}
                    onClick={() => handleSelectDate(date)}
                  >
                    <span className="day-number">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
