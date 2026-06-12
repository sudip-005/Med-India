import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('med_india_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch active user profile
  const fetchProfile = useCallback(async (authToken, throwOnError = false) => {
    try {
      setLoading(true);
      const data = await apiService.auth.me(authToken);
      setUser(data.user);
      setProfile(data.profile);
      
      // If patient, fetch cart items to populate cartCount
      if (data.user.role === 'PATIENT') {
        try {
          const cartData = await apiService.cart.getCart(authToken);
          const count = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          setCartCount(count);
        } catch (cartErr) {
          console.warn('Failed to load cart items in profile fetch:', cartErr);
          setCartCount(0);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Clear token if invalid/expired
      localStorage.removeItem('med_india_token');
      setToken(null);
      setUser(null);
      setProfile(null);
      if (throwOnError) throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check token on mount
  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  // Login handler
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.auth.login(email, password);
      const authToken = response.session.access_token;
      
      localStorage.setItem('med_india_token', authToken);
      setToken(authToken);
      await fetchProfile(authToken, true);
      return response;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Signup handler
  const signup = async (role, signupData) => {
    try {
      setError(null);
      setLoading(true);
      let response;
      if (role === 'PATIENT') {
        response = await apiService.auth.signupPatient(signupData);
      } else if (role === 'DOCTOR') {
        response = await apiService.auth.signupDoctor(signupData);
      } else if (role === 'RETAILER') {
        response = await apiService.auth.signupRetailer(signupData);
      } else {
        throw new Error('Invalid signup role');
      }
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (token) {
        await apiService.auth.logout(token);
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('med_india_token');
      setToken(null);
      setUser(null);
      setProfile(null);
      setCartCount(0);
      setLoading(false);
    }
  };

  const updateCartBadge = async () => {
    if (token && user?.role === 'PATIENT') {
      try {
        const cartData = await apiService.cart.getCart(token);
        const count = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      } catch (err) {
        console.error('Failed to update cart badge:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        error,
        cartCount,
        login,
        signup,
        logout,
        refreshUser: () => fetchProfile(token),
        updateCartBadge
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
