import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ 
  children, 
  requiredRole = 'user', // 'user', 'admin', or null for any authenticated
  fallback = null 
}) => {
  const { isAuthenticated, userRole, showToast } = useAuth();

  // Not authenticated at all
  if (!isAuthenticated) {
    if (showToast) {
      showToast('Please log in to access this page', 'error');
    }
    return fallback || (
      <div className="private-route-access-denied">
        <div className="access-denied-icon">🔒</div>
        <h3>Access Restricted</h3>
        <p>Please log in to continue</p>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole === 'admin' && userRole !== 'admin') {
    if (showToast) {
      showToast('Admin access required', 'error');
    }
    return (
      <div className="private-route-access-denied">
        <div className="access-denied-icon">⛔</div>
        <h3>Admin Access Only</h3>
        <p>You don't have permission to view this page</p>
      </div>
    );
  }

  // All checks passed, render children
  return children;
};

export default PrivateRoute;