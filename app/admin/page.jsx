"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

const DEFAULT_HERO_VIDEO = "https://res.cloudinary.com/dpxpczyhh/video/upload/v1781972444/landscape__jupv1z.mp4";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'works'

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [leadFilter, setLeadFilter] = useState('all'); // 'all', 'completed', 'partial'
  const [selectedLead, setSelectedLead] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const [works, setWorks] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(true);

  const [newWork, setNewWork] = useState({
    title: '',
    category: 'explainers',
    url: ''
  });
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // 3D iPad Hero Video State
  const [heroVideoUrl, setHeroVideoUrl] = useState(DEFAULT_HERO_VIDEO);
  const [heroVideoInput, setHeroVideoInput] = useState(DEFAULT_HERO_VIDEO);
  const [isSavingHeroVideo, setIsSavingHeroVideo] = useState(false);
  const [heroSaveSuccess, setHeroSaveSuccess] = useState(false);

  // Slot Notification Badge State
  const DEFAULT_NOTIFICATION_TEXT = "2 slots left for current month";
  const [slotText, setSlotText] = useState(DEFAULT_NOTIFICATION_TEXT);
  const [slotTextInput, setSlotTextInput] = useState(DEFAULT_NOTIFICATION_TEXT);
  const [slotEnabled, setSlotEnabled] = useState(true);
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [slotSaveSuccess, setSlotSaveSuccess] = useState(false);

  const ADMIN_PASSWORD = "EXT124";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedLead(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const leadsQ = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribeLeads = onSnapshot(leadsQ, (querySnapshot) => {
      const leadsData = [];
      querySnapshot.forEach((doc) => {
        leadsData.push({ id: doc.id, ...doc.data() });
      });
      setLeads(leadsData);
      setLoadingLeads(false);
    });

    const worksQ = query(collection(db, 'works'), orderBy('createdAt', 'desc'));
    const unsubscribeWorks = onSnapshot(worksQ, (querySnapshot) => {
      const worksData = [];
      querySnapshot.forEach((doc) => {
        worksData.push({ id: doc.id, ...doc.data() });
      });
      setWorks(worksData);
      setLoadingWorks(false);
    });

    // Listen for 3D iPad Hero Video settings
    const heroDocRef = doc(db, 'settings', 'hero');
    const unsubscribeHero = onSnapshot(heroDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().videoUrl) {
        setHeroVideoUrl(docSnap.data().videoUrl);
        setHeroVideoInput(docSnap.data().videoUrl);
      } else {
        setHeroVideoUrl(DEFAULT_HERO_VIDEO);
        setHeroVideoInput(DEFAULT_HERO_VIDEO);
      }
    });

    // Listen for Slot Notification Badge settings
    const notifDocRef = doc(db, 'settings', 'notification');
    const unsubscribeNotif = onSnapshot(notifDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.text !== undefined) {
          setSlotText(data.text);
          setSlotTextInput(data.text);
        }
        if (data.enabled !== undefined) {
          setSlotEnabled(data.enabled);
        }
      } else {
        setSlotText(DEFAULT_NOTIFICATION_TEXT);
        setSlotTextInput(DEFAULT_NOTIFICATION_TEXT);
        setSlotEnabled(true);
      }
    });

    return () => {
      unsubscribeLeads();
      unsubscribeWorks();
      unsubscribeHero();
      unsubscribeNotif();
    };
  }, [isAuthenticated]);

  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      await deleteDoc(doc(db, 'leads', id));
    }
  };

  const handleDeleteWork = async (id) => {
    if (window.confirm("Are you sure you want to delete this portfolio video?")) {
      await deleteDoc(doc(db, 'works', id));
    }
  };

  const handleAddWork = async (e) => {
    e.preventDefault();
    if (!newWork.title || !newWork.url) return alert("Please fill all fields");

    setIsSubmittingWork(true);
    try {
      await addDoc(collection(db, 'works'), {
        ...newWork,
        createdAt: serverTimestamp()
      });
      setNewWork({ title: '', category: 'explainers', url: '' });
    } catch (err) {
      console.error(err);
      alert("Error adding work");
    }
    setIsSubmittingWork(false);
  };

  const handleSaveHeroVideo = async (e) => {
    e.preventDefault();
    if (!heroVideoInput.trim()) return alert("Please enter a valid video URL");

    setIsSavingHeroVideo(true);
    try {
      await setDoc(doc(db, 'settings', 'hero'), {
        videoUrl: heroVideoInput.trim(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      setHeroSaveSuccess(true);
      setTimeout(() => setHeroSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Error updating iPad video: " + err.message);
    }
    setIsSavingHeroVideo(false);
  };

  const handleResetHeroVideo = async () => {
    if (window.confirm("Reset 3D iPad video to default Cloudinary video?")) {
      setHeroVideoInput(DEFAULT_HERO_VIDEO);
      setIsSavingHeroVideo(true);
      try {
        await setDoc(doc(db, 'settings', 'hero'), {
          videoUrl: DEFAULT_HERO_VIDEO,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setHeroSaveSuccess(true);
        setTimeout(() => setHeroSaveSuccess(false), 4000);
      } catch (err) {
        console.error(err);
        alert("Error resetting iPad video");
      }
      setIsSavingHeroVideo(false);
    }
  };

  const handleSaveSlotNotification = async (e) => {
    e.preventDefault();
    if (!slotTextInput.trim()) return alert("Please enter text for the slot badge");

    setIsSavingSlot(true);
    try {
      await setDoc(doc(db, 'settings', 'notification'), {
        text: slotTextInput.trim(),
        enabled: slotEnabled,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSlotSaveSuccess(true);
      setTimeout(() => setSlotSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Error updating slot badge: " + err.message);
    }
    setIsSavingSlot(false);
  };

  const handlePresetSlot = (preset) => {
    setSlotTextInput(preset);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box glass">
          <h2>Admin Dashboard</h2>
          <p>Please enter the master password to view leads.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="admin-input"
            />
            <button type="submit" className="cta-button primary-cta">Login</button>
          </form>
          <Link href="/" className="back-link">← Back to Site</Link>
        </div>
      </div>
    );
  }

  const completedLeadsCount = leads.filter(l => l.isCompleted !== false && l.status !== 'Incomplete').length;
  const partialLeadsCount = leads.filter(l => l.isCompleted === false || l.status === 'Incomplete').length;

  const filteredLeads = leads.filter(l => {
    if (leadFilter === 'completed') return l.isCompleted !== false && l.status !== 'Incomplete';
    if (leadFilter === 'partial') return l.isCompleted === false || l.status === 'Incomplete';
    return true;
  });

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <div className="admin-actions">
          <button onClick={() => setIsAuthenticated(false)} className="cta-button secondary-cta">Logout</button>
        </div>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          className={`cta-button ${activeTab === 'leads' ? 'primary-cta' : 'secondary-cta'}`}
          onClick={() => setActiveTab('leads')}
        >
          Project Leads ({leads.length})
        </button>
        <button
          className={`cta-button ${activeTab === 'works' ? 'primary-cta' : 'secondary-cta'}`}
          onClick={() => setActiveTab('works')}
        >
          Manage Portfolio ({works.length})
        </button>
      </div>

      {activeTab === 'leads' && (
        <div className="table-container glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setLeadFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: leadFilter === 'all' ? '1.5px solid #0f172a' : '1px solid var(--border-color)',
                  background: leadFilter === 'all' ? '#0f172a' : 'rgba(255, 255, 255, 0.8)',
                  color: leadFilter === 'all' ? '#ffffff' : '#475569',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                All Leads ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setLeadFilter('completed')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: leadFilter === 'completed' ? '1.5px solid #059669' : '1px solid var(--border-color)',
                  background: leadFilter === 'completed' ? '#059669' : 'rgba(255, 255, 255, 0.8)',
                  color: leadFilter === 'completed' ? '#ffffff' : '#059669',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ✓ Submitted ({completedLeadsCount})
              </button>
              <button
                type="button"
                onClick={() => setLeadFilter('partial')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: leadFilter === 'partial' ? '1.5px solid #d97706' : '1px solid var(--border-color)',
                  background: leadFilter === 'partial' ? '#d97706' : 'rgba(255, 255, 255, 0.8)',
                  color: leadFilter === 'partial' ? '#ffffff' : '#d97706',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ⚠️ Incomplete / Left Midway ({partialLeadsCount})
              </button>
            </div>

            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              ⚡ Auto-saves incomplete forms every 5s so you never lose a client lead!
            </span>
          </div>

          {loadingLeads ? (
            <div className="loading-state">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="empty-state">No leads found in this view.</div>
          ) : (
            <table className="excel-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Website</th>
                  <th>Budget</th>
                  <th>Start Date</th>
                  <th>Turnaround</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const isPartial = lead.isCompleted === false || lead.status === 'Incomplete';
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      style={{ 
                        background: isPartial ? 'rgba(245, 158, 11, 0.04)' : undefined,
                        cursor: 'pointer'
                      }}
                      title="Click anywhere to inspect full details"
                    >
                      <td>
                        {isPartial ? (
                          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: '600', fontSize: '0.78rem' }}>
                            ⚠️ Incomplete
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '600', fontSize: '0.78rem' }}>
                            ✓ Submitted
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="font-medium">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontWeight: '700',
                            textAlign: 'left',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.95rem',
                            textDecoration: 'underline'
                          }}
                        >
                          {lead.name || <em style={{ color: '#94a3b8' }}>Anonymous Client</em>}
                        </button>
                      </td>
                      <td>
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}>{lead.email}</a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>
                        {lead.whatsapp ? (
                          <a href={`https://wa.me/${lead.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{lead.whatsapp}</a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>
                        {lead.website ? (
                          <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{lead.website}</a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>
                        {lead.budget ? (
                          <span className="badge">{lead.budget}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>{lead.startDate || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td>{lead.turnaroundTime || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td className="desc-cell">
                        <div className="scrollable-desc">
                          {lead.description || <em style={{ color: '#94a3b8' }}>No description</em>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }} 
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🔍 View
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }} 
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Full Details Modal for Selected Lead */}
      {selectedLead && (
        <div 
          className="lead-modal-overlay"
          onClick={() => setSelectedLead(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div 
            className="lead-modal-card glass"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: 'clamp(24px, 5vw, 40px)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {selectedLead.name || 'Anonymous Client'}
                  </h2>
                  {selectedLead.isCompleted === false || selectedLead.status === 'Incomplete' ? (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: '600', padding: '4px 12px' }}>
                      ⚠️ Incomplete Lead Draft
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '600', padding: '4px 12px' }}>
                      ✓ Submitted Project Lead
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                  Submitted on {selectedLead.createdAt?.toDate ? selectedLead.createdAt.toDate().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : 'Recently'}
                </p>
              </div>

              <button 
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#64748b',
                  transition: 'background 0.2s ease',
                  flexShrink: 0
                }}
                title="Close details"
              >
                ✕
              </button>
            </div>

            {/* Grid of Contact Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              
              {/* Email Box */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  {selectedLead.email ? (
                    <a href={`mailto:${selectedLead.email}`} style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none', wordBreak: 'break-all', fontSize: '0.95rem' }}>
                      {selectedLead.email}
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Not provided</span>
                  )}
                  {selectedLead.email && (
                    <button 
                      type="button"
                      onClick={() => handleCopy(selectedLead.email, 'email')}
                      style={{ background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0, fontWeight: '600' }}
                    >
                      {copiedField === 'email' ? '✓ Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              {/* WhatsApp Box */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  WhatsApp / Phone
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  {selectedLead.whatsapp ? (
                    <a 
                      href={`https://wa.me/${selectedLead.whatsapp?.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#16a34a', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}
                    >
                      💬 {selectedLead.whatsapp}
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Not provided</span>
                  )}
                  {selectedLead.whatsapp && (
                    <button 
                      type="button"
                      onClick={() => handleCopy(selectedLead.whatsapp, 'whatsapp')}
                      style={{ background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0, fontWeight: '600' }}
                    >
                      {copiedField === 'whatsapp' ? '✓ Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              {/* Website Box */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Website / URL
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  {selectedLead.website ? (
                    <a 
                      href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none', wordBreak: 'break-all', fontSize: '0.95rem' }}
                    >
                      🔗 {selectedLead.website}
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Not provided</span>
                  )}
                  {selectedLead.website && (
                    <button 
                      type="button"
                      onClick={() => handleCopy(selectedLead.website, 'website')}
                      style={{ background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0, fontWeight: '600' }}
                    >
                      {copiedField === 'website' ? '✓ Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Project Scope Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#eff6ff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Estimated Budget</span>
                <strong style={{ fontSize: '1.05rem', color: '#1e3a8a' }}>{selectedLead.budget || 'Flexible / Not set'}</strong>
              </div>
              <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Target Start Date</span>
                <strong style={{ fontSize: '1.05rem', color: '#14532d' }}>{selectedLead.startDate || 'As soon as possible'}</strong>
              </div>
              <div style={{ background: '#faf5ff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e9d5ff' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b21a8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Turnaround</span>
                <strong style={{ fontSize: '1.05rem', color: '#581c87' }}>{selectedLead.turnaroundTime || 'Standard'}</strong>
              </div>
            </div>

            {/* Complete Full Project Description */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  Full Project Description & Brief:
                </h3>
                {selectedLead.description && (
                  <button 
                    type="button"
                    onClick={() => handleCopy(selectedLead.description, 'description')}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {copiedField === 'description' ? '✓ Description Copied' : '📋 Copy Text'}
                  </button>
                )}
              </div>
              <div 
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '22px',
                  fontSize: '1.02rem',
                  lineHeight: '1.8',
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  minHeight: '130px',
                  userSelect: 'text'
                }}
              >
                {selectedLead.description || <em style={{ color: '#94a3b8' }}>No description was entered by the client.</em>}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {selectedLead.whatsapp && (
                  <a 
                    href={`https://wa.me/${selectedLead.whatsapp?.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="cta-button primary-cta"
                    style={{ background: '#16a34a', borderColor: '#15803d', textDecoration: 'none', padding: '10px 22px', fontSize: '0.9rem' }}
                  >
                    Open WhatsApp Chat
                  </a>
                )}
                {selectedLead.email && (
                  <a 
                    href={`mailto:${selectedLead.email}?subject=EXTProduction%20Project%20Inquiry`}
                    className="cta-button secondary-cta"
                    style={{ textDecoration: 'none', padding: '10px 22px', fontSize: '0.9rem' }}
                  >
                    Send Email
                  </a>
                )}
              </div>

              <button 
                type="button"
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this lead?")) {
                    await deleteDoc(doc(db, 'leads', selectedLead.id));
                    setSelectedLead(null);
                  }
                }}
                className="delete-btn"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                🗑️ Delete Lead
              </button>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'works' && (
        <div className="works-management-container" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

          <div className="add-work-form glass" style={{ padding: '30px', borderRadius: '24px', flex: '1', minWidth: '300px', height: 'fit-content' }}>
            <h2>Add New Video</h2>
            <form onSubmit={handleAddWork} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Video Title</label>
                <input
                  type="text"
                  value={newWork.title}
                  onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                  placeholder="e.g. Acme Corp Explainer"
                  className="admin-input"
                  style={{ margin: 0 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category</label>
                <select
                  value={newWork.category}
                  onChange={(e) => setNewWork({ ...newWork, category: e.target.value })}
                  className="admin-input"
                  style={{ margin: 0 }}
                >
                  <option value="explainers">Product Explainer</option>
                  <option value="keynotes">Product Keynote</option>
                  <option value="vertical">Vertical Video</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Video URL (MP4 or YouTube)</label>
                <input
                  type="text"
                  value={newWork.url}
                  onChange={(e) => setNewWork({ ...newWork, url: e.target.value })}
                  placeholder="https://..."
                  className="admin-input"
                  style={{ margin: 0 }}
                  required
                />
              </div>

              <button type="submit" className="cta-button primary-cta" disabled={isSubmittingWork} style={{ marginTop: '10px' }}>
                {isSubmittingWork ? 'Adding...' : 'Add to Portfolio'}
              </button>
            </form>
          </div>

          <div className="works-list" style={{ flex: '2', minWidth: '400px' }}>
            <h2>Current Portfolio</h2>
            <div className="table-container glass" style={{ marginTop: '20px' }}>
              {loadingWorks ? (
                <div className="loading-state">Loading portfolio...</div>
              ) : works.length === 0 ? (
                <div className="empty-state">No portfolio videos added yet.</div>
              ) : (
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>URL</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map((work) => (
                      <tr key={work.id}>
                        <td className="font-medium">{work.title}</td>
                        <td><span className="badge">{work.category}</span></td>
                        <td>
                          <a href={work.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {work.url}
                          </a>
                        </td>
                        <td>
                          <button onClick={() => handleDeleteWork(work.id)} className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 3D iPad Hero Video Management Section */}
          <div className="ipad-management-card glass" style={{ width: '100%', marginTop: '20px', padding: 'clamp(16px, 4vw, 32px)', borderRadius: '24px', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>📱 3D iPad Hero Video</h2>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)', fontWeight: '600' }}>Live on Homepage</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px', margin: 0 }}>
                  Change the video displayed inside the interactive 3D iPad on your homepage in real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetHeroVideo}
                className="cta-button secondary-cta"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                ↺ Reset to Default
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '25px', alignItems: 'center' }}>
              <form onSubmit={handleSaveHeroVideo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.92rem', color: '#0f172a' }}>
                    iPad Video URL (Direct MP4 / Cloudinary URL)
                  </label>
                  <input
                    type="text"
                    value={heroVideoInput}
                    onChange={(e) => setHeroVideoInput(e.target.value)}
                    placeholder="https://res.cloudinary.com/... or https://...mp4"
                    className="admin-input"
                    style={{ margin: 0, width: '100%' }}
                    required
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    Tip: Direct video links (.mp4 or Cloudinary) render automatically inside the 3D iPad screen.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    className="cta-button primary-cta"
                    disabled={isSavingHeroVideo}
                    style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                  >
                    {isSavingHeroVideo ? 'Saving to Homepage...' : '✓ Update iPad Video'}
                  </button>
                  {heroSaveSuccess && (
                    <span style={{ color: '#059669', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✓ Updated! Live on iPad now.
                    </span>
                  )}
                </div>
              </form>

              {/* Video Preview Box */}
              <div style={{ background: 'rgba(15, 23, 42, 0.04)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Live iPad Video Preview:
                </div>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                  <video
                    key={heroVideoInput}
                    src={heroVideoInput}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Slot Notification Badge Section */}
          <div className="slot-management-card glass" style={{ width: '100%', marginTop: '24px', padding: '32px', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>🚨 Bottom Left Slot Notification Badge</h2>
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: '600' }}>Live on Website</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px', margin: 0 }}>
                  Customize the slot availability text displayed on the bottom-left floating badge in real-time.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSlotNotification} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.92rem', color: '#0f172a' }}>
                  Badge Text (Full customizable text)
                </label>
                <input
                  type="text"
                  value={slotTextInput}
                  onChange={(e) => setSlotTextInput(e.target.value)}
                  placeholder="e.g. 2 slots left for current month"
                  className="admin-input"
                  style={{ margin: 0, width: '100%', maxWidth: '600px' }}
                  required
                />

                {/* Quick Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Quick Presets:</span>
                  {['1 slot left for current month', '2 slots left for current month', '3 slots left for current month', '5 slots left for this month', 'Only 2 slots left for this week', 'Fully booked for this month'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSlot(preset)}
                      style={{
                        background: slotTextInput === preset ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.05)',
                        color: slotTextInput === preset ? '#ef4444' : '#475569',
                        border: slotTextInput === preset ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(15, 23, 42, 0.1)',
                        padding: '5px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Badge Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '5px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Live Visual Preview:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(239, 68, 68, 0.32)', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.12)', width: 'fit-content' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.25)' }}></span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '500', color: '#0f172a' }}>{slotTextInput || '2 slots left for current month'}</span>
                    <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>→</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={slotEnabled}
                      onChange={(e) => setSlotEnabled(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                    />
                    Show Badge on Website
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '5px' }}>
                <button
                  type="submit"
                  className="cta-button primary-cta"
                  disabled={isSavingSlot}
                  style={{ padding: '12px 28px', fontSize: '0.95rem', background: '#ef4444', borderColor: '#dc2626' }}
                >
                  {isSavingSlot ? 'Saving...' : '✓ Update Slot Badge'}
                </button>
                {slotSaveSuccess && (
                  <span style={{ color: '#059669', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✓ Updated! Live on website now.
                  </span>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
