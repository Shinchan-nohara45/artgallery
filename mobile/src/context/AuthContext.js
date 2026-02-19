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

  // Use makeRedirectUri which now correctly generates the unique proxy URL
  // thanks to the unique slug 'artbloom-mobile' in app.json
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({
      useProxy: true,
      scheme: 'exp'
    }),
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
        
        if (parsedUser && parsedUser.token) {
            setUser(parsedUser);
            // Set default header for axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        } else {
            // Invalid session data, clear it
            console.log('Found user info but no token, clearing session.');
            await SecureStore.deleteItemAsync('userInfo');
            setUser(null);
        }
      }
    } catch (e) {
      console.log('Error checking login status', e);
      // Ensure we don't leave partial state
      setUser(null);
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
          console.log("Initiating Google Sign-In...");
          const result = await promptAsync({ useProxy: true });
          console.log("Google Sign-In Result:", JSON.stringify(result));

          if (result?.type === 'success') {
              const { id_token } = result.params;
              console.log("Got ID Token, signing into Firebase...");
              
              const credential = GoogleAuthProvider.credential(id_token);
              const firebaseUserCredential = await signInWithCredential(auth, credential);
              const firebaseUser = firebaseUserCredential.user;
              console.log("Firebase Sign-In Success:", firebaseUser.email);

              // Now sync with backend
              console.log("Syncing with backend...");
              const { data } = await axios.post(`${API_URL}/auth/google`, {
                  name: firebaseUser.displayName,
                  email: firebaseUser.email,
                  googleId: firebaseUser.uid,
                  imageUrl: firebaseUser.photoURL
              });
              console.log("Backend Sync Success:", data.email);

              setUser(data);
              await SecureStore.setItemAsync('userInfo', JSON.stringify(data));
              axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
              return { success: true };
          } else {
              console.log("Google Sign-In was not successful. Type:", result?.type);
              return { success: false, error: 'Google sign in cancelled or failed' };
          }
      } catch (error) {
          console.error('Google Login Error Full:', error);
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error('Firebase Error Code:', errorCode);
          console.error('Firebase Error Message:', errorMessage);
          return { success: false, error: error.message };
      }
  };

  const register = async (name, email, password, username) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        username,
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
