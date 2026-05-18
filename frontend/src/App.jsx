import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './components/Home/Home';
import Translate from './components/Translate/Translate';
import History from './components/History/History';
import Admin from './components/Admin/Admin';
import Settings from './components/Settings/Settings';
import LoginModal from './components/Auth/LoginModal';
import SignupModal from './components/Auth/SignupModal';
import Toast from './components/Common/Toast';
import './App.css';

const AppContent = () => {
  const [activeScreen, setActiveScreen] = useState('home');
  const { 
    isAuthenticated, 
    userRole, 
    showToast,
    showLoginModal,
    showSignupModal,
    closeLoginModal,
    closeSignupModal,
    openSignupModal,
    openLoginModal
  } = useAuth();

  // Redirect admin to dashboard after login
  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      setActiveScreen('admin');
    } else if (isAuthenticated && userRole === 'user') {
      setActiveScreen(prev => prev === 'translate' ? 'translate' : 'home');
    }
  }, [isAuthenticated, userRole]);

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      setActiveScreen('admin');
    } else {
      setActiveScreen(prev => prev === 'translate' ? 'translate' : 'home');
    }
  };

  const handleScreenChange = (screen) => {
    if (!isAuthenticated) {
      if (screen === 'home' || screen === 'translate') {
        setActiveScreen(screen);
      } else {
        openLoginModal();
      }
      return;
    }

    if (userRole === 'admin') {
      if (screen === 'admin' || screen === 'home' || screen === 'settings') {
        setActiveScreen(screen);
      } else {
        showToast('Admin access only to Dashboard', 'error');
      }
      return;
    }

    if (userRole === 'user') {
      if (screen === 'home' || screen === 'translate' || screen === 'history' || screen === 'settings') {
        setActiveScreen(screen);
      } else if (screen === 'admin') {
        showToast('Admin access only', 'error');
      }
      return;
    }

    setActiveScreen(screen);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home': return <Home onNavigate={handleScreenChange} />;
      case 'translate': return <Translate />;
      case 'history': return <History />;
      case 'admin': return <Admin />;
      case 'settings': return <Settings />;
      default: return <Home onNavigate={handleScreenChange} />;
    }
  };

  return (
    <div className="app">
      <Navbar 
        activeScreen={activeScreen} 
        onScreenChange={handleScreenChange}
        onShowLogin={openLoginModal}
        onShowSignup={openSignupModal}
      />
      <main className="main-content">
        {renderScreen()}
      </main>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal}
        onSwitchToSignup={() => {
          closeLoginModal();
          openSignupModal();
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={closeSignupModal}
        onSwitchToLogin={() => {
          closeSignupModal();
          openLoginModal();
        }}
      />
      <Toast />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;