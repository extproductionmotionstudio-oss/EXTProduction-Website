"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import MacNotch from './MacNotch';
import { getOptimizedVideoUrl, getVideoPosterUrl } from '../lib/videoOptimizer';

export default function OurWork({ onOpenModal }) {
  const [filter, setFilter] = useState('all');
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInView, setIsInView] = useState(true);

  const videoRefs = useRef({});
  const iframeRefs = useRef({});
  const swiperRef = useRef(null);
  const userInteractedRef = useRef(false);
  const userPausedRef = useRef(false);
  const playPromiseRef = useRef({});
  const sectionRef = useRef(null);
  const ytPlayingStates = useRef({});

  const handleUserInteraction = () => {
    userInteractedRef.current = true;
  };

  const safePlay = async (videoEl, key = 'default') => {
    if (!videoEl) return;
    try {
      videoEl.muted = !userInteractedRef.current;
      const promise = videoEl.play();
      if (promise !== undefined) {
        playPromiseRef.current[key] = promise;
        await promise;
        playPromiseRef.current[key] = null;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn("Playback error:", err);
      }
      playPromiseRef.current[key] = null;
    }
  };

  const safePause = async (videoEl, key = 'default') => {
    if (!videoEl) return;
    const pendingPromise = playPromiseRef.current[key];
    if (pendingPromise) {
      try {
        await pendingPromise;
      } catch (_) {}
    }
    try {
      videoEl.pause();
    } catch (_) {}
  };

  useEffect(() => {
    const q = query(collection(db, 'works'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const worksData = [];
      snapshot.forEach(doc => {
        worksData.push({ id: doc.id, ...doc.data() });
      });
      setWorks(worksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          setIsInView(entries[0].isIntersecting);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const isYouTube = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  const filteredWorks = works
    .filter(v => {
      if (filter === 'all') {
        return v.category !== 'vertical';
      }
      return v.category === filter;
    })
    .sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : (typeof a.orderIndex === 'number' ? a.orderIndex : 9999);
      const orderB = typeof b.order === 'number' ? b.order : (typeof b.orderIndex === 'number' ? b.orderIndex : 9999);
      if (orderA !== orderB) return orderA - orderB;
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  const filtersWrapperRef = useRef(null);

  const handleFilterChange = (category, e) => {
    // Explicitly pause existing videos before swapping tabs
    document.querySelectorAll('#work video').forEach((v) => {
      try { v.pause(); } catch (_) {}
    });
    document.querySelectorAll('#work iframe').forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
      } catch (_) {}
    });

    setFilter(category);
    setActiveIndex(0);
    userPausedRef.current = false;
    setIsPlaying(true);
    handleUserInteraction();

    if (filtersWrapperRef.current && e && e.currentTarget) {
      const wrapper = filtersWrapperRef.current;
      const btn = e.currentTarget;
      const targetScrollLeft = btn.offsetLeft - (wrapper.clientWidth / 2) + (btn.clientWidth / 2);
      wrapper.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      });
    }
  };

  // Play/Pause active video smoothly when slide or visibility changes
  useEffect(() => {
    // Handle HTML5 videos in the active card vs inactive cards directly in DOM
    document.querySelectorAll('#work .stacked-card, #work .swiper-slide').forEach((card) => {
      const isCardActive = card.classList.contains('active') || card.classList.contains('swiper-slide-active');
      const vid = card.querySelector('video');
      const iframe = card.querySelector('iframe');

      if (vid) {
        if (isCardActive && isInView && !userPausedRef.current) {
          vid.style.opacity = '1';
          safePlay(vid, 'active-auto');
          setIsPlaying(true);
        } else {
          try { vid.pause(); } catch (_) {}
          if (!isCardActive) {
            vid.style.opacity = '0'; 
            try { vid.currentTime = 0; } catch (_) {}
          }
        }
      }

      if (iframe) {
        if (isCardActive && isInView && !userPausedRef.current) {
          iframe.style.opacity = '1';
          if (userInteractedRef.current) {
            iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'unMute' }), '*');
          }
          iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
          setIsPlaying(true);
        } else {
          if (!isCardActive) {
            iframe.style.opacity = '0';
          }
          iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
        }
      }
    });
  }, [activeIndex, filter, isInView]);

  const getYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Instant direct single-click play/pause toggle
  const handleCardClick = async (e, v, index) => {
    e.stopPropagation();
    handleUserInteraction();

    const card = e.currentTarget;
    const isSlideActive = card.classList.contains('swiper-slide-active') ||
                          card.classList.contains('active') ||
                          card.closest('.swiper-slide-active') ||
                          card.closest('.stacked-card.active');

    // If a non-active side slide in Swiper is clicked, navigate directly to it
    if (!isSlideActive && swiperRef.current) {
      if (typeof swiperRef.current.slideToLoop === 'function') {
        swiperRef.current.slideToLoop(index);
      }
      return;
    }

    const vid = card.querySelector('video');
    const iframe = card.querySelector('iframe');
    const videoKey = v ? v.id : `${index}`;

    if (vid) {
      if (vid.paused) {
        userPausedRef.current = false;
        setIsPlaying(true);
        await safePlay(vid, videoKey);
      } else {
        userPausedRef.current = true;
        setIsPlaying(false);
        await safePause(vid, videoKey);
      }
    } else if (iframe) {
      const currentlyPlaying = ytPlayingStates.current[v.id] !== false;
      if (currentlyPlaying) {
        userPausedRef.current = true;
        iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
        ytPlayingStates.current[v.id] = false;
        setIsPlaying(false);
      } else {
        userPausedRef.current = false;
        if (userInteractedRef.current) {
          iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'unMute' }), '*');
        }
        iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
        ytPlayingStates.current[v.id] = true;
        setIsPlaying(true);
      }
    }
  };

  return (
    <motion.section
      id="work"
      className="work-section"
      ref={sectionRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <MacNotch />

      <div className="work-header">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          Our Work
        </motion.h2>
        <motion.div 
          ref={filtersWrapperRef}
          className="work-filters-wrapper"
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="work-filters">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={(e) => handleFilterChange('all', e)}>All</button>
            <button className={`filter-btn ${filter === 'explainers' ? 'active' : ''}`} onClick={(e) => handleFilterChange('explainers', e)}>Product Explainers</button>
            <button className={`filter-btn ${filter === 'keynotes' ? 'active' : ''}`} onClick={(e) => handleFilterChange('keynotes', e)}>Product Keynotes</button>
            <button className={`filter-btn ${filter === 'vertical' ? 'active' : ''}`} onClick={(e) => handleFilterChange('vertical', e)}>Vertical Creatives</button>
          </div>
        </motion.div>
      </div>

      <div className="work-swiper-container" onTouchStart={handleUserInteraction} onMouseDown={handleUserInteraction}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading portfolio...</p>
        ) : works.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No works added yet. Add some in the Admin panel.</p>
        ) : filter === 'vertical' ? (
          <div className="p3d-slider-outer-wrapper">
            <div className="p3d-slider-container reveal" id="p3dContainer">
              <div className="p3d-nav">
                <div className="p3d-btn" id="p3dPrev" onClick={(e) => { e.stopPropagation(); handleUserInteraction(); userPausedRef.current = false; setIsPlaying(true); setActiveIndex((prev) => (prev - 1 + filteredWorks.length) % filteredWorks.length); }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
                  </svg>
                </div>
                <div className="p3d-btn" id="p3dNext" onClick={(e) => { e.stopPropagation(); handleUserInteraction(); userPausedRef.current = false; setIsPlaying(true); setActiveIndex((prev) => (prev + 1) % filteredWorks.length); }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
                  </svg>
                </div>
              </div>

              {filteredWorks.map((v, i) => {
                const totalStackCards = filteredWorks.length;
                let offset = i - activeIndex;
                if (offset > Math.floor(totalStackCards / 2)) offset -= totalStackCards;
                if (offset < -Math.floor(totalStackCards / 2)) offset += totalStackCards;

                let cardClass = 'stacked-card';
                if (offset === 0) cardClass += ' active';
                else if (offset === -1) cardClass += ' left-1';
                else if (offset === 1) cardClass += ' right-1';
                else if (offset === -2) cardClass += ' left-2';
                else if (offset === 2) cardClass += ' right-2';
                else if (offset < 0) cardClass += ' hidden-left';
                else cardClass += ' hidden-right';

                if (offset === 0 && isPlaying) {
                  cardClass += ' playing';
                }

                const isYt = isYouTube(v.url);
                const optimizedVideoUrl = getOptimizedVideoUrl(v.url, { isVertical: true });
                const posterUrl = getVideoPosterUrl(v.url, { isVertical: true });

                return (
                  <div key={`${filter}-${v.id}`} className={cardClass} onClick={(e) => handleCardClick(e, v, i)}>
                    {posterUrl && (
                      <img 
                        src={posterUrl} 
                        alt={v.title}
                        loading="eager"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 'inherit',
                          zIndex: 0
                        }}
                      />
                    )}
                    {isYt ? (
                      <iframe
                        ref={(el) => iframeRefs.current[v.id] = el}
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYouTubeId(v.url)}?enablejsapi=1&mute=1`}
                        title={v.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: offset === 0 ? 'auto' : 'none',
                          zIndex: 1,
                          opacity: offset === 0 ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        }}
                      ></iframe>
                    ) : (
                      <video
                        ref={(el) => videoRefs.current[v.id] = el}
                        src={optimizedVideoUrl}
                        poster={posterUrl}
                        controls={false}
                        preload="auto"
                        loop
                        playsInline
                        muted
                        onPlay={() => { if (offset === 0) setIsPlaying(true); }}
                        onPause={() => { if (offset === 0) setIsPlaying(false); }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 'inherit',
                          zIndex: 1,
                          opacity: offset === 0 ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                    )}
                    {offset === 0 && !isPlaying && (
                      <div className="p3d-play" style={{ zIndex: 10 }}></div>
                    )}
                    {offset === 0 && (
                      <div 
                        className="video-title-badge"
                        style={{
                          position: 'absolute',
                          bottom: '20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.88)',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                          border: '1px solid rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 1px #ffffff',
                          borderRadius: '9999px',
                          padding: '7px 18px',
                          color: '#0f172a',
                          fontSize: '0.88rem',
                          fontWeight: '600',
                          letterSpacing: '-0.01em',
                          pointerEvents: 'none',
                          maxWidth: '85%',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ 
                          width: '7px', 
                          height: '7px', 
                          borderRadius: '50%', 
                          background: '#2563eb', 
                          boxShadow: '0 0 8px rgba(37, 99, 235, 0.6)', 
                          display: 'inline-block',
                          flexShrink: 0
                        }}></span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Swiper
            key={filter}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setActiveIndex(swiper.realIndex);
              setTimeout(() => {
                const activeSlide = swiper.el?.querySelector('.swiper-slide-active');
                const vid = activeSlide?.querySelector('video');
                if (vid && isInView && !userPausedRef.current) {
                  safePlay(vid, 'swiper-mount');
                  setIsPlaying(true);
                }
              }, 50);
            }}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            speed={400}
            threshold={3}
            preventClicks={false}
            preventClicksPropagation={false}
            touchStartPreventDefault={false}
            loop={filteredWorks.length > 2}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.realIndex);
              userPausedRef.current = false;
              setIsPlaying(true);
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: -60,
              depth: 200,
              modifier: 1,
              scale: 0.88,
              slideShadows: false,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="mySwiper"
          >
            {filteredWorks.map((v, index) => {
              const isYt = isYouTube(v.url);
              const isActive = index === activeIndex;
              const optimizedVideoUrl = getOptimizedVideoUrl(v.url, { isVertical: false });
              const posterUrl = getVideoPosterUrl(v.url, { isVertical: false });

              return (
                <SwiperSlide key={`${filter}-${v.id}`}>
                  <div 
                    className={`video-card ${isActive && isPlaying ? 'playing' : ''}`} 
                    onClick={(e) => handleCardClick(e, v, index)}
                  >
                    <div 
                      className="video-thumbnail" 
                      style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '100%', 
                        background: '#0a0a0a', 
                        pointerEvents: 'auto',
                        overflow: 'hidden',
                        borderRadius: '16px'
                      }}
                    >
                      {posterUrl && (
                        <img 
                          src={posterUrl} 
                          alt={v.title}
                          loading="eager"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 'inherit',
                            zIndex: 0
                          }}
                        />
                      )}
                      {isYt ? (
                        <iframe
                          ref={(el) => iframeRefs.current[v.id] = el}
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${getYouTubeId(v.url)}?enablejsapi=1&mute=1`}
                          title={v.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 1,
                            opacity: isActive ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                          }}
                        ></iframe>
                      ) : (
                        <video
                          ref={(el) => videoRefs.current[v.id] = el}
                          src={optimizedVideoUrl}
                          poster={posterUrl}
                          controls={false}
                          preload="auto"
                          playsInline
                          loop
                          muted
                          onPlay={(e) => {
                            const isCardActive = e.currentTarget.closest('.swiper-slide-active, .stacked-card.active');
                            if (isCardActive) {
                              setIsPlaying(true);
                            }
                          }}
                          onPause={(e) => {
                            const isCardActive = e.currentTarget.closest('.swiper-slide-active, .stacked-card.active');
                            if (isCardActive) {
                              setIsPlaying(false);
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            borderRadius: 'inherit',
                            zIndex: 1,
                            opacity: isActive ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                          }}
                        />
                      )}

                      {/* Play Button Overlay - Smoothly shown ONLY when paused */}
                      {isActive && !isPlaying && (
                        <div 
                          className="play-overlay" 
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '68px',
                            height: '68px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            zIndex: 10,
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
                            transition: 'opacity 0.25s ease, transform 0.25s ease'
                          }}
                        >
                          <div style={{
                            width: 0,
                            height: 0,
                            borderTop: '10px solid transparent',
                            borderBottom: '10px solid transparent',
                            borderLeft: '16px solid #111',
                            marginLeft: '5px'
                          }}></div>
                        </div>
                      )}

                      {/* Premium White Frosted Glass Video Title Badge */}
                      <div 
                        className="video-title-badge"
                        style={{
                          position: 'absolute',
                          bottom: '22px',
                          left: '22px',
                          zIndex: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.88)',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                          border: '1px solid rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 1px #ffffff',
                          borderRadius: '9999px',
                          padding: '7px 18px',
                          color: '#0f172a',
                          fontSize: '0.88rem',
                          fontWeight: '600',
                          letterSpacing: '-0.01em',
                          pointerEvents: 'none',
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <span style={{ 
                          width: '7px', 
                          height: '7px', 
                          borderRadius: '50%', 
                          background: '#2563eb', 
                          boxShadow: '0 0 8px rgba(37, 99, 235, 0.6)', 
                          display: 'inline-block',
                          flexShrink: 0
                        }}></span>
                        <span>{v.title}</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </motion.section>
  );
}
