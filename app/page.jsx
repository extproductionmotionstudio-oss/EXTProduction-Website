"use client";

import { useState } from 'react';
import Notification from '../components/Notification';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustedBy from '../components/TrustedBy';
import OurWork from '../components/OurWork';
import OurProcess from '../components/OurProcess';
import Testimonials from '../components/Testimonials';
import FAQs from '../components/FAQs';
import Footer from '../components/Footer';
import VideoModal from '../components/VideoModal';
import Founder from '../components/Founder';

export default function Home() {
  const [activeVideoState, setActiveVideoState] = useState({ url: null, time: 0 });

  // If a specific URL is passed, play that. Otherwise, it's the main showreel.
  const handleOpenModal = (url = null, time = 0) => {
    setActiveVideoState({ 
      url: typeof url === 'string' ? url : 'SHOWREEL_DEFAULT',
      time 
    });
  };
  const handleCloseModal = () => setActiveVideoState({ url: null, time: 0 });

  return (
    <main>
      <Notification />
      <Navbar />
      
      <Hero onOpenModal={handleOpenModal} />
      <TrustedBy />
      <OurWork onOpenModal={handleOpenModal} />
      <Founder />
      <OurProcess />
      <Testimonials />
      <FAQs />
      <Footer />
      
      <VideoModal videoUrl={activeVideoState.url} startTime={activeVideoState.time} onClose={handleCloseModal} />
    </main>
  );
}
