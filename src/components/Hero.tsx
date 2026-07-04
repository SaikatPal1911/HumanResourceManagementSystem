import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="frame hero-wrap">
        <div className="hero-media">
          <div className="hero-grid"></div>
          <div className="hero-float">
            <div className="float-item" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>📅</div>
            <div className="float-item" style={{ top: '25%', right: '15%', animationDelay: '1s' }}>👤</div>
            <div className="float-item" style={{ bottom: '20%', left: '20%', animationDelay: '2s' }}>💰</div>
            <div className="float-item" style={{ bottom: '35%', right: '25%', animationDelay: '0.5s' }}>✅</div>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="eyebrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 2 11 13 2 7" />
              </svg>
              Human Resource Management System
            </div>
            <h1>Every workday, <span>perfectly aligned.</span></h1>
            <p>
              A centralized platform to digitize and streamline core HR operations. Manage employee profiles,
              attendance, leave, and payroll with powerful, easy-to-use tools that adapt to your organization.
            </p>
            <div className="hero-actions">
              <Link to="/registration" className="btn-hero-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Get Started for Free
              </Link>
              <Link to="/contact" className="btn-hero-ghost">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <path d="M14 5v14" />
                  <path d="M2 5v14" />
                  <path d="M2 12h12" />
                </svg>
                Request a Demo
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="glass-card">
              <h3>Quick Overview</h3>
              <div className="score-grid">
                <div className="score">
                  <b>15+</b>
                  <span>Modules</span>
                </div>
                <div className="score">
                  <b>99%</b>
                  <span>Uptime</span>
                </div>
                <div className="score">
                  <b>24/7</b>
                  <span>Support</span>
                </div>
                <div className="score">
                  <b>ISO</b>
                  <span>Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;