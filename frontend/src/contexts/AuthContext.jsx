import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Check token on load and restore user
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('bridge_user');
    const savedUserRole = localStorage.getItem('userRole');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setUserRole(savedUserRole || 'user');
      setUserType(savedUserType || null);
      setIsAuthenticated(true);
    }
  }, []);

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hideToast = () => setToast(null);

  // Modal functions
  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };
  
  const closeLoginModal = () => setShowLoginModal(false);
  
  const openSignupModal = () => {
    setShowSignupModal(true);
    setShowLoginModal(false);
  };
  
  const closeSignupModal = () => setShowSignupModal(false);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('bridge_user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userType', userData.type);
      
      setToken(newToken);
      setUser(userData);
      setUserRole(userData.role);
      setUserType(userData.type);
      setIsAuthenticated(true);
      
      showToastMessage(`Welcome ${userData.name || userData.email}!`, 'success');
      return { success: true, user: userData, role: userData.role };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      showToastMessage(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register function - auto login after registration
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      showToastMessage('Account created successfully!', 'success');
      
      // Auto login after registration
      const loginResponse = await authAPI.login(userData.email, userData.password);
      const { token: newToken, user: userDataFromLogin } = loginResponse.data;
      
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('bridge_user', JSON.stringify(userDataFromLogin));
      localStorage.setItem('userRole', userDataFromLogin.role);
      localStorage.setItem('userType', userDataFromLogin.type);
      
      setToken(newToken);
      setUser(userDataFromLogin);
      setUserRole(userDataFromLogin.role);
      setUserType(userDataFromLogin.type);
      setIsAuthenticated(true);
      
      showToastMessage(`Welcome ${userDataFromLogin.name}!`, 'success');
      return { success: true, data: response.data, user: userDataFromLogin, role: userDataFromLogin.role };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      showToastMessage(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('bridge_user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userType');
    
    setToken(null);
    setUser(null);
    setUserRole('guest');
    setUserType(null);
    setIsAuthenticated(false);
    
    showToastMessage('Logged out successfully', 'info');
  };

  const value = {
    // State
    user,
    token,
    isAuthenticated,
    userRole,
    userType,
    loading,
    toast,
    
    // Modal state
    showLoginModal,
    showSignupModal,
    
    // Modal functions
    openLoginModal,
    closeLoginModal,
    openSignupModal,
    closeSignupModal,
    
    // Toast functions
    showToast: showToastMessage,
    hideToast,
    
    // Auth functions
    login,
    register,
    logout,
    
    // Helpers
    isAdmin: userRole === 'admin',
    isUser: isAuthenticated && userRole === 'user',
    isGuest: !isAuthenticated,
    isDeaf: userType === 'deaf',
    isHearing: userType === 'hearing',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };