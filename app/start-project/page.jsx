"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CustomDatePicker from '../../components/DatePicker';

export default function StartProject() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    website: '',
    description: '',
    budget: '',
    startDate: '',
    turnaroundTime: ''
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const leadDocIdRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Debounced Auto-Save for Partial / Incomplete Leads (Saves after 5s pause to minimize Firebase writes)
  useEffect(() => {
    const hasContent = Boolean(
      formData.name.trim() ||
      formData.email.trim() ||
      formData.whatsapp.trim() ||
      formData.description.trim() ||
      formData.website.trim()
    );

    if (!hasContent || status === 'success' || status === 'submitting') return;

    const timer = setTimeout(async () => {
      try {
        if (!leadDocIdRef.current) {
          // Create new incomplete lead draft in Firestore
          const docRef = await addDoc(collection(db, 'leads'), {
            ...formData,
            isCompleted: false,
            status: 'Incomplete',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          leadDocIdRef.current = docRef.id;
        } else {
          // Update the same document without creating duplicates
          await setDoc(doc(db, 'leads', leadDocIdRef.current), {
            ...formData,
            isCompleted: false,
            status: 'Incomplete',
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        console.warn("Partial lead auto-save notice:", err);
      }
    }, 5000); // 5-second interval

    return () => clearTimeout(timer);
  }, [formData, status]);

  // Instantly scroll to top when Thank You screen displays
  useEffect(() => {
    if (status === 'success') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      if (leadDocIdRef.current) {
        // Finalize existing draft lead to Completed
        await setDoc(doc(db, 'leads', leadDocIdRef.current), {
          ...formData,
          isCompleted: true,
          status: 'Completed',
          submittedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        // Direct complete submission
        await addDoc(collection(db, 'leads'), {
          ...formData,
          isCompleted: true,
          status: 'Completed',
          createdAt: serverTimestamp(),
          submittedAt: serverTimestamp()
        });
      }
      
      // Dispatch real-time Telegram Bot notification (non-blocking)
      fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).catch(err => console.warn("Telegram notification send notice:", err));

      setStatus('success');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (error) {
      console.error("Error submitting form: ", error);
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <main className="form-page-container">
      <Navbar />

      <section className="form-section">
        <div className="form-wrapper glass">
          {status === 'success' ? (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2 className="success-title">
                Thank you for filling<br />out our form
              </h2>
              <p className="success-desc">
                We've received your project details and will get back to you shortly.
              </p>
              <Link href="/" className="cta-button primary-cta success-btn">
                Return to Home
              </Link>
            </div>
          ) : (
            <>
              <h1 className="form-title">Start your project now!</h1>
              <p className="form-subtitle">Thank you for choosing our Motion Studio!</p>
              <p className="form-desc">Fill out our form with your project details, and we will get back to you shortly.</p>

              <form onSubmit={handleSubmit} className="custom-form">
                <div className="form-group">
                  <label htmlFor="name">Name? *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="What do you like to be called?"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email? *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your preferred email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp">WhatsApp Number? *</label>
                  <p className="field-hint">(begin with country code, example : +165...)</p>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    placeholder="Your WhatsApp number"
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Company website? *</label>
                  <p className="field-hint">(example : chatgpt.com)</p>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    placeholder="Enter your @company website (e.g. chatgpt.com)"
                    required
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Write a brief description about your project *</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Feel free to share the video content, style, reference, or any helpful links"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">What's your budget for this project? *</label>
                  <select
                    id="budget"
                    name="budget"
                    required
                    value={formData.budget}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select a range</option>
                    <option value="$1K - $2K">$1K - $2K</option>
                    <option value="$2K - $3K">$2K - $3K</option>
                    <option value="$3K - $5K">$3K - $5K</option>
                    <option value="$5K - $10K">$5K - $10K</option>
                    <option value="$10K+">$10K+</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="startDate">When would you like to start your project? *</label>
                  <CustomDatePicker
                    value={formData.startDate}
                    onChange={(val) => setFormData(prev => ({ ...prev, startDate: val }))}
                    placeholder="Select start date..."
                  />
                  <input
                    type="hidden"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="turnaroundTime">Expected turnaround time for the video *</label>
                  <input
                    type="text"
                    id="turnaroundTime"
                    name="turnaroundTime"
                    placeholder="Type in days, hours and minutes"
                    required
                    value={formData.turnaroundTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group book-call-group">
                  <label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Book a call below :</label>
                  <div>
                    <a
                      href="https://calendly.com/extproductionmotionstudio/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-button secondary-cta book-call-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 26px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        textDecoration: 'none',
                        background: '#ffffff',
                        border: '1.5px solid var(--border-color)',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-dark)' }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Book a call ↗
                    </a>
                  </div>
                </div>

                {status === 'error' && (
                  <div className="error-message">
                    An error occurred: {errorMessage}
                  </div>
                )}

                <button type="submit" className="cta-button primary-cta submit-btn" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Submitting...' : 'Let\'s Go! →'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
