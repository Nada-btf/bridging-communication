import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Translate', action: () => onNavigate('translate') },
      { label: 'How it works', action: () => {} },
      { label: 'Pricing', action: () => {} },
    ],
    company: [
      { label: 'About Us', action: () => {
          const aboutSection = document.querySelector('.about-section');
          if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
        } 
      },
      { label: 'Contact', action: () => {
          const contactSection = document.getElementById('contact');
          if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      },
      { label: 'Careers', action: () => {} },
    ],
    legal: [
      { label: 'Privacy Policy', action: () => {} },
      { label: 'Terms of Service', action: () => {} },
      { label: 'Cookie Policy', action: () => {} },
    ],
    social: [
      { label: 'Twitter', icon: '🐦', action: () => window.open('https://twitter.com', '_blank') },
      { label: 'LinkedIn', icon: '🔗', action: () => window.open('https://linkedin.com', '_blank') },
      { label: 'GitHub', icon: '💻', action: () => window.open('https://github.com/Nada-btf/bridging-communication', '_blank') },
    ]
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-dot">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M8 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span>Bridging Communication</span>
            </div>
            <p className="footer-description">
              Breaking barriers and bridging gaps between deaf and hearing communities through real-time bidirectional sign language translation.
            </p>
            <div className="footer-social">
              {footerLinks.social.map((social, index) => (
                <button key={index} className="social-btn" onClick={social.action}>
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer-links-column">
            <h4>Product</h4>
            <ul>
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <button onClick={link.action}>{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Company</h4>
            <ul>
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <button onClick={link.action}>{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Legal</h4>
            <ul>
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <button onClick={link.action}>{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="footer-newsletter">
            <h4>Stay updated</h4>
            <p>Get the latest news about accessibility and sign language technology.</p>
            <form className="newsletter-form" onSubmit={(e) => {
              e.preventDefault();
              alert('Newsletter subscription demo - backend integration pending');
            }}>
              <input type="email" placeholder="Your email address" />
              <button type="submit">→</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {currentYear} Bridging Communication. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <button onClick={() => {}}>Privacy</button>
            <button onClick={() => {}}>Terms</button>
            <button onClick={() => {}}>Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;