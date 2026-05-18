import React from 'react';
import { useAuth } from '../../contexts/AuthContext';  // ✅ Fixed import path
import './Toast.css';

const Toast = () => {
  const { toast, hideToast } = useAuth();

  if (!toast) return null;

  const { message, type = 'success' } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3L3 21h18L12 3z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return '✓';
    }
  };

  return (
    <div className={`toast-notification toast-${type}`} onClick={hideToast}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={hideToast}>
        ✕
      </button>
      <div className="toast-progress-bar"></div>
    </div>
  );
};

export default Toast;