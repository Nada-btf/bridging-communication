import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import HeroSection from './heroSection';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import './home.css';

const Home = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate('translate');
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <HeroSection 
        isAuthenticated={isAuthenticated}
        onGetStarted={handleGetStarted}
        onNavigate={onNavigate}
      />

      {/* Stats Section - Redesigned */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">430<span>M+</span></div>
            <div className="stat-label">People with hearing loss worldwide</div>
            <div className="stat-source">Source: WHO</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">300<span>+</span></div>
            <div className="stat-label">Sign languages globally</div>
            <div className="stat-source">Source: WFD</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">2<span>-Way</span></div>
            <div className="stat-label">Real-time bidirectional translation</div>
            <div className="stat-source">Instant communication</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24<span>/7</span></div>
            <div className="stat-label">Accessible platform</div>
            <div className="stat-source">Always available</div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <AboutSection />

      {/* Mission & Vision Section */}
      <div className="mission-vision-section">
        <div className="mission-vision-grid">
          <div className="mv-card">
            <div className="mv-icon">📖</div>
            <h3>Our Story</h3>
            <p>
              Founded in 2026, Bridging Communication was born from a simple yet powerful idea: 
              communication is a fundamental human right. With over 430 million people worldwide 
              living with disabling hearing loss, we recognized the urgent need for an accessible, 
              real-time translation platform that truly works both ways sign to speech AND speech to sign.
            </p>
          </div>
          <div className="mv-card">
            <div className="mv-icon">🌟</div>
            <h3>What Makes Us Different</h3>
            <p>
              Unlike traditional solutions that offer only one-way translation (speech-to-text or text-to-speech), 
              our system provides complete bidirectional interaction. Deaf users can sign naturally, and hearing 
              users can speak freely our platform bridges the gap in real-time using cutting-edge AI.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-dot"></div>
            <span>Bridging Communication</span>
          </div>
          <div className="footer-links">
            <a href="/home" onClick={(e) => { e.preventDefault(); onNavigate?.('home'); }}>Home</a>
            <a href="/translate" onClick={(e) => { e.preventDefault(); onNavigate?.('translate'); }}>Translate</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
          <div className="footer-copyright">
            © 2026 Bridging Communication — Bridging the gap between deaf and hearing communities. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;