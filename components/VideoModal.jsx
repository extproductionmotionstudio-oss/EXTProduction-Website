"use client";

import { useEffect, useRef } from 'react';
import { getOptimizedVideoUrl } from '../lib/videoOptimizer';

export default function VideoModal({ videoUrl, startTime = 0, onClose }) {
  const modalRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Ghost audio fix: pause video explicitly before unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  if (!videoUrl) return null;

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = isYouTube ? getYouTubeId(videoUrl) : null;

  // Placeholder showreel if they just click the "Showreel" button in hero
  const defaultShowreelUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"; // Example placeholder
  
  const finalUrl = videoUrl === 'SHOWREEL_DEFAULT' ? defaultShowreelUrl : videoUrl;
  const finalIsYt = finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be');
  const finalYtId = finalIsYt ? getYouTubeId(finalUrl) : null;

  return (
    <div className="modal active" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: '#000', padding: 0, overflow: 'hidden', aspectRatio: '16/9', display: 'flex', maxWidth: '1200px' }}>
        <button 
          className="close-modal" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          &times;
        </button>
        
        <div className="modal-video-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {finalIsYt ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${finalYtId}?autoplay=1`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0 }}
            ></iframe>
          ) : (
            <video 
              ref={videoRef}
              src={getOptimizedVideoUrl(finalUrl)} 
              autoPlay 
              controls 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onLoadedMetadata={(e) => {
                if (startTime) {
                  e.target.currentTime = startTime;
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
