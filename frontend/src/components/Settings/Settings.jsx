import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, userRole, showToast } = useAuth();

  // Initialize state from localStorage
  const [notifications, setNotifications] = useState(
    localStorage.getItem('settings_notifications') !== 'false'
  );
  const [autoSpeak, setAutoSpeak] = useState(
    localStorage.getItem('settings_autoSpeak') !== 'false'
  );
  const [saveHistory, setSaveHistory] = useState(
    localStorage.getItem('settings_saveHistory') !== 'false'
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('settings_darkMode') === 'true'
  );

  // Apply dark mode immediately when toggled
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  const handleSave = () => {
    localStorage.setItem('settings_notifications', notifications);
    localStorage.setItem('settings_autoSpeak', autoSpeak);
    localStorage.setItem('settings_saveHistory', saveHistory);
    localStorage.setItem('settings_darkMode', darkMode);
    showToast('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-header-icon">🛠️</div>
        <div>
          <h1>Settings</h1>
          <p>Manage your preferences and account options</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="settings-card">
        <div className="settings-card-title">👤 Account</div>
        <div className="settings-profile-row">
          <div className="settings-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="settings-profile-info">
            <div className="settings-profile-name">{user?.name || 'User'}</div>
            <div className="settings-profile-email">{user?.email || ''}</div>
            <span className={`settings-role-badge ${userRole}`}>
              {userRole === 'admin' ? '🔑 Admin' : '👤 User'}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <div className="settings-card-title">🎛️ Preferences</div>

        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">🔔 Notifications</span>
            <span className="settings-row-desc">Receive alerts for new translations and updates</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">🔊 Auto-Speak Results</span>
            <span className="settings-row-desc">Automatically speak translation text aloud</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={autoSpeak} onChange={e => setAutoSpeak(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">📜 Save History</span>
            <span className="settings-row-desc">Automatically save translations to your history</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={saveHistory} onChange={e => setSaveHistory(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">🌙 Dark Mode</span>
            <span className="settings-row-desc">Switch to a darker interface theme</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-primary settings-save-btn" onClick={handleSave}>
          💾 Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
