import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { ResponseType, makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (request) {
      console.log('Google Auth Request Object:', request);
      console.log('Generated Redirect URI:', request.redirectUri);
    }
  }, [request]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userInfo = await SecureStore.getItemAsync('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        // Set default header for axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      }
    } catch (e) {
      console.log('Error checking login status', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
        console.log(`Attempting login to: ${API_URL}/auth/login`);
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      setUser(data);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      console.error('Login error', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const googleLogin = async () => {
      try {
          const result = await promptAsync();
          if (result?.type === 'success') {
              const { id_token } = result.params;
              const credential = GoogleAuthProvider.credential(id_token);
              const firebaseUserCredential = await signInWithCredential(auth, credential);
              const firebaseUser = firebaseUserCredential.user;

              // Now sync with backend
              const { data } = await axios.post(`${API_URL}/auth/google`, {
                  name: firebaseUser.displayName,
                  email: firebaseUser.email,
                  googleId: firebaseUser.uid,
                  imageUrl: firebaseUser.photoURL
              });

              setUser(data);
              await SecureStore.setItemAsync('userInfo', JSON.stringify(data));
              axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
              return { success: true };
          } else {
              return { success: false, error: 'Google sign in cancelled' };
          }
      } catch (error) {
          console.error('Google Login Error:', error);
          return { success: false, error: error.message };
      }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      setUser(data);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      console.error('Register error', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = async (userData) => {
      setUser(userData);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
