import React from 'react';

const HeroSection = ({ isAuthenticated, onGetStarted, onNavigate }) => {
  const handleAuthAction = () => {
    if (isAuthenticated) {
      onGetStarted();
    } else {
      const loginBtn = document.getElementById('showLoginBtn');
      if (loginBtn) loginBtn.click();
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>
          Break the barrier.<br />
          <span className="highlight">Bridge the gap.</span>
        </h1>
        <p>
          Real-time bidirectional translation between sign language and spoken text — 
          empowering seamless conversations for deaf and hearing communities everywhere.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary hero-btn" onClick={handleAuthAction}>
            {isAuthenticated ? 'Start translating →' : 'Get started →'}
          </button>
          <button className="btn-outline hero-btn" onClick={() => {
            const aboutSection = document.querySelector('.about-section');
            if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
          }}>
            Learn more
          </button>
        </div>
      </div>
      <div className="hero-image">
        <img 
          src="/assets/sign-language-hero.jpg" 
          alt="Deaf and hearing person communicating using sign language"
          className="hero-img"
        />
      </div>
    </section>
  );
};

export default HeroSection;