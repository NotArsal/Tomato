import React, { createContext, useState, useContext, useEffect } from 'react';
import { signInWithRedirect, getRedirectResult, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for redirect result on mount
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const firebaseToken = await result.user.getIdToken();
          const { data } = await api.post('/auth/firebase', { firebaseToken });
          
          if (!data.needsRole) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
          } else {
            // New user via Google - redirect to signup to pick role
            sessionStorage.setItem('pending_google_auth', JSON.stringify({
              firebaseToken, name: data.name, email: data.email
            }));
            window.location.href = '/signup';
          }
        }
      } catch (error) {
        console.error('Redirect auth error:', error);
      }

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkRedirect();
  }, []);

  // Email/Password login
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Email/Password signup
  const signup = async (name, email, password, role, phone, address) => {
    const { data } = await api.post('/auth/signup', { name, email, password, role, phone, address });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Google Sign-In via Redirect (Fixes popup-blocked errors)
  const loginWithGoogle = () => {
    signInWithRedirect(auth, googleProvider);
  };

  // Complete Google signup with role selection
  const completeGoogleSignup = async (firebaseToken, role) => {
    const { data } = await api.post('/auth/firebase', { firebaseToken, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    firebaseSignOut(auth).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, completeGoogleSignup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
