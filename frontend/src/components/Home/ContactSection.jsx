import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ContactSection = () => {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      showToast('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    { icon: '📧', label: 'Email', value: 'hello@bridgingcommunication.com', href: 'mailto:hello@bridgingcommunication.com' },
    { icon: '📞', label: 'Phone', value: '+213 (0) 5 XX XX XX XX', href: 'tel:+213555555555' },
    { icon: '📍', label: 'Address', value: 'Constantine 2 University - Abdelhamid Mehri, Algeria', href: null },
    { icon: '🌐', label: 'Website', value: 'www.bridgingcommunication.com', href: 'https://www.bridgingcommunication.com' }
  ];

  return (
    <section className="contact-section" id="contact">
      <div className="section-header">
        <h2>Contact Us</h2>
        <p>We'd love to hear from you</p>
      </div>
      <div className="contact-grid">
        <div className="contact-info">
          <h3>Get in touch</h3>
          <p>Have questions about our platform? Want to collaborate or provide feedback? Reach out to our team.</p>
          <div className="contact-details">
            {contactInfo.map((info, index) => (
              <div className="contact-detail" key={index}>
                <div className="contact-icon">{info.icon}</div>
                <div className="contact-text">
                  <div className="contact-label">{info.label}</div>
                  {info.href ? (
                    <a href={info.href} className="contact-value">{info.value}</a>
                  ) : (
                    <span className="contact-value">{info.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="How can we help?"
            />
          </div>
          <div className="form-group">
            <label>Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us what you think..."
              rows="5"
              required
            />
          </div>
          <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send message →'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;