import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Metrics from '../components/Metrics';
import Workflow from '../components/Workflow';
import Testimonials from '../components/Testimonials';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import './LandingPage.css';

const LandingPage = () => {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const metricEls = document.querySelectorAll('.num');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el) => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement; // Cast to HTMLElement to access textContent
        const max = Number(el.getAttribute('data-count')) || 0;
        let value = 0;
        const step = Math.max(1, Math.ceil(max / 36));

        const tick = () => {
          value += step;
          if (value >= max) {
            el.textContent = String(max);
            return;
          }
          el.textContent = String(value);
          requestAnimationFrame(tick);
        };

        tick();
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.4 });

    metricEls.forEach((el) => counterObserver.observe(el));

    // Cleanup function for observers
    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Metrics />
        <Workflow />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;