import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// ========== AUTH ENDPOINTS ==========

/**
 * Login user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise} - Returns user data and token
 * 
 * @example
 * const result = await authAPI.login('user@example.com', 'password123');
 * if (result.success) {
 *   const { token, user } = result.data;
 * }
 */
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return {
      success: true,
      data: response.data,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed',
      status: error.response?.status
    };
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} userData.type - 'deaf' or 'hearing'
 * @returns {Promise} - Returns registration result
 * 
 * @example
 * const result = await authAPI.register({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'password123',
 *   type: 'deaf'
 * });
 */
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return {
      success: true,
      data: response.data,
      message: 'Account created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Registration failed',
      status: error.response?.status
    };
  }
};

/**
 * Logout user
 * @returns {Promise} - Returns logout result
 */
const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    // Even if API call fails, clear local storage
    return {
      success: false,
      error: error.response?.data?.error || 'Logout failed'
    };
  }
};

/**
 * Get current user profile
 * @returns {Promise} - Returns user profile data
 */
const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get user data'
    };
  }
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @param {string} updates.name - New name (optional)
 * @param {string} updates.email - New email (optional)
 * @returns {Promise} - Returns updated user data
 */
const updateProfile = async (updates) => {
  try {
    const response = await api.put('/auth/profile', updates);
    return {
      success: true,
      user: response.data.user,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Update failed'
    };
  }
};

/**
 * Change user password
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} - Returns result
 */
const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword });
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Password change failed'
    };
  }
};

/**
 * Request password reset
 * @param {string} email - User's email address
 * @returns {Promise} - Returns result
 */
const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return {
      success: true,
      message: 'Password reset link sent to your email'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Request failed'
    };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise} - Returns result
 */
const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Password reset failed'
    };
  }
};

/**
 * Verify email address
 * @param {string} token - Verification token
 * @returns {Promise} - Returns result
 */
const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Verification failed'
    };
  }
};

/**
 * Resend verification email
 * @param {string} email - User's email address
 * @returns {Promise} - Returns result
 */
const resendVerification = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return {
      success: true,
      message: 'Verification email sent'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send verification email'
    };
  }
};

/**
 * Refresh authentication token
 * @returns {Promise} - Returns new token
 */
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return {
      success: true,
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Token refresh failed'
    };
  }
};

/**
 * Check if email exists
 * @param {string} email - Email to check
 * @returns {Promise} - Returns existence status
 */
const checkEmailExists = async (email) => {
  try {
    const response = await api.post('/auth/check-email', { email });
    return {
      success: true,
      exists: response.data.exists
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Check failed'
    };
  }
};

// ========== SOCIAL AUTH (Optional - for future implementation) ==========

/**
 * Login with Google
 * @param {string} googleToken - Google OAuth token
 * @returns {Promise} - Returns user data and token
 */
const googleLogin = async (googleToken) => {
  try {
    const response = await api.post('/auth/google', { token: googleToken });
    return {
      success: true,
      data: response.data,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Google login failed'
    };
  }
};

// ========== EXPORT ==========

const authAPI = {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  checkEmailExists,
  googleLogin
};

export default authAPI;