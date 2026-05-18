import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for toast notifications
 * @param {number} duration - Duration in milliseconds to show the toast (default: 3000)
 * @returns {Object} Toast functions and state
 * 
 * Usage:
 * const { toast, showToast, hideToast } = useToast();
 * showToast('Message sent!', 'success');
 */
const useToast = (duration = 3000) => {
  const [toast, setToast] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  // Hide toast function
  const hideToast = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setToast(null);
  }, [timeoutId]);

  // Show toast function
  const showToast = useCallback((message, type = 'success') => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set new toast
    setToast({ message, type, timestamp: Date.now() });
    
    // Auto-hide after duration
    const newTimeoutId = setTimeout(() => {
      hideToast();
    }, duration);
    
    setTimeoutId(newTimeoutId);
  }, [duration, hideToast, timeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    toast,
    showToast,
    hideToast,
    isVisible: !!toast
  };
};

export default useToast;