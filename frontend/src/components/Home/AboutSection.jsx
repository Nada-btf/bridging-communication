import React from 'react';

const AboutSection = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Our Mission',
      description: 'To create an inclusive world where communication barriers between deaf and hearing individuals no longer exist, enabling equal participation in all aspects of life.'
    },
    {
      icon: '💡',
      title: 'Our Vision',
      description: 'A future where real-time sign language translation is as common as spell-check, making every conversation accessible to everyone, everywhere.'
    },
    {
      icon: '⚡',
      title: 'Our Technology',
      description: 'Powered by cutting-edge computer vision (MediaPipe) and speech recognition (Vosk), delivering accurate, low-latency bidirectional translation.'
    }
  ];

  return (
    <section className="about-section">
      <div className="section-header">
        <h2>About Us</h2>
        <p>Bridging the communication gap between deaf and hearing communities</p>
      </div>
      <div className="about-grid">
        {features.map((feature, index) => (
          <div className="about-card" key={index}>
            <div className="about-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutSection;