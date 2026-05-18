import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SignToSpeech from './SignToSpeech';
import SpeechToSign from './SpeechToSign';
import './Translate.css';

const Translate = () => {
  const { isAuthenticated, userType, openLoginModal, openSignupModal } = useAuth();
  const isLocked = !isAuthenticated;
  
  // Determine which panel is active based on user type
  const isDeafUser = isAuthenticated && userType === 'deaf';
  const isHearingUser = isAuthenticated && userType === 'hearing';
  
  // For guests, both panels are locked (disabled)
  // For deaf users, only Sign to Speech works
  // For hearing users, only Speech to Sign works
  const isSignToSpeechDisabled = isLocked || (isAuthenticated && isHearingUser);
  const isSpeechToSignDisabled = isLocked || (isAuthenticated && isDeafUser);

  return (
    <div className="translate-container">
      <div className="translate-header">
        <h1>Translation Workspace</h1>
        <p>
          {!isAuthenticated && 'Sign up to unlock translation features'}
          {isDeafUser && 'You are logged in as a Deaf user. Use Sign to Speech to communicate.'}
          {isHearingUser && 'You are logged in as a Hearing user. Use Speech to Sign to communicate.'}
        </p>
      </div>
      
      <div className="translation-grid">
        <div className={`panel-wrapper ${isSignToSpeechDisabled ? 'disabled-panel' : 'active-panel'}`}>
          {isSignToSpeechDisabled && isAuthenticated && isHearingUser && (
            <div className="panel-disabled-overlay">
              <div className="panel-disabled-icon">🔒</div>
              <h4>Sign to Speech</h4>
              <p>Available for Deaf users only</p>
            </div>
          )}
          <SignToSpeech isLocked={isSignToSpeechDisabled} />
        </div>
        
        <div className={`panel-wrapper ${isSpeechToSignDisabled ? 'disabled-panel' : 'active-panel'}`}>
          {isSpeechToSignDisabled && isAuthenticated && isDeafUser && (
            <div className="panel-disabled-overlay">
              <div className="panel-disabled-icon">🔒</div>
              <h4>Speech to Sign</h4>
              <p>Available for Hearing users only</p>
            </div>
          )}
          <SpeechToSign isLocked={isSpeechToSignDisabled} />
        </div>
      </div>
      
      {/* Guest Overlay */}
      {isLocked && (
        <div className="guest-overlay">
          <div className="guest-overlay-content">
            <div className="guest-icon">🔒</div>
            <h3>Sign up to translate</h3>
            <p>Create a free account to use sign language translation features</p>
            <button className="btn-primary" onClick={openSignupModal}>
              Create free account
            </button>
            <button 
              className="btn-outline" 
              onClick={openLoginModal}
              style={{ marginTop: '12px' }}
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Translate;