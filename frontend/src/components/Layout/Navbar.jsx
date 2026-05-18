import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../services/api';
import './Navbar.css';

const Navbar = ({ activeScreen, onScreenChange, onShowLogin, onShowSignup }) => {
  const { isAuthenticated, userRole, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifDropdown(false);
  }, [activeScreen]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationsAPI.get();
      setNotifications(response.data || []);
      const unread = response.data?.filter(n => !n.isRead).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    // Instant local update for better UX
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    for (const notif of unreadNotifications) {
      try {
        await notificationsAPI.markAsRead(notif.id);
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }
    fetchNotifications();
  };

  // Role-based navigation items
  const getNavItems = () => {
    const items = [{ id: 'home', label: 'Home', show: true }];

    if (!isAuthenticated) {
      items.push({ id: 'translate', label: 'Translate', show: true });
    } else if (userRole === 'admin') {
      items.push({ id: 'admin', label: 'Dashboard', show: true });
    } else {
      items.push({ id: 'translate', label: 'Translate', show: true });
      items.push({ id: 'history', label: 'History', show: true });
    }

    return items;
  };

  const handleNavClick = (screenId) => {
    onScreenChange(screenId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    onScreenChange('home');
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const navItems = getNavItems();

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => handleNavClick('home')}>
          <div className="logo-dot">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-text">Bridging Communication</span>
        </div>

        <div className="navbar-links desktop-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${activeScreen === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="navbar-auth desktop-auth">
          {isAuthenticated ? (
            <div className="auth-wrapper">
              <div className="notifications-wrapper" ref={notifRef}>
                <button
                  className={`notification-bell ${showNotifDropdown ? 'active' : ''}`}
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="notifications-dropdown">
                    <div className="notif-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={handleMarkAllRead}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.filter(n => !n.isRead).length === 0 ? (
                        <div className="notif-empty">
                          <span className="empty-icon">📭</span>
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        notifications.filter(n => !n.isRead).map(notif => (
                          <div 
                            key={notif.id} 
                            className={`notif-item unread ${notif.type}`}
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                          >
                            <div className="notif-icon">
                              {notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : 'ℹ️'}
                            </div>
                            <div className="notif-content">
                              <p className="notif-message">{notif.message}</p>
                              <span className="notif-time">{formatTime(notif.createdAt)}</span>
                            </div>
                            <div className="notif-dot"></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="user-menu">
                <div className="user-avatar">{getUserInitial()}</div>
                <div className="user-dropdown">
                  <button className="user-name-btn">
                    {user?.name || 'User'}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  <div className="dropdown-menu">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">{getUserInitial()}</div>
                      <div>
                        <div className="dropdown-user-name">{user?.name || 'User'}</div>
                        <div className="dropdown-user-email">{user?.email || ''}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    {userRole === 'user' && (
                      <button className="dropdown-item" onClick={() => handleNavClick('history')}>
                        📜 History
                      </button>
                    )}
                    {userRole === 'admin' && (
                      <button className="dropdown-item" onClick={() => handleNavClick('admin')}>
                        ⚙️ Dashboard
                      </button>
                    )}
                    <button className="dropdown-item" onClick={() => handleNavClick('settings')}>
                      🛠️ Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" id="showLoginBtn" onClick={onShowLogin}>
                Log in
              </button>
              <button className="signup-btn" id="showSignupBtn" onClick={onShowSignup}>
                Sign up
              </button>
            </div>
          )}
        </div>

        <button
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${activeScreen === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
          <div className="mobile-menu-divider"></div>
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">{getUserInitial()}</div>
                <div>
                  <div className="mobile-user-name">{user?.name || 'User'}</div>
                  <div className="mobile-user-email">{user?.email || ''}</div>
                </div>
              </div>
              <button className="mobile-logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <button className="mobile-login-btn" onClick={onShowLogin}>Log in</button>
              <button className="mobile-signup-btn" onClick={onShowSignup}>Sign up</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
