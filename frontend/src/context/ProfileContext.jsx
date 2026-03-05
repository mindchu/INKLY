import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../util/api';

// Create the context
const ProfileContext = createContext();

// Custom hook to use the profile context
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within ProfileProvider');
  }
  return context;
};

// Provider component
export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedProfile = React.useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (fetchedProfile.current) return;
      fetchedProfile.current = true;
      try {
        const data = await api.get('/users/me');
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        fetchedProfile.current = false;
        // If not logged in, profile remains null
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Update profile data
  const updateProfile = async (newData) => {
    try {
      const updated = await api.put('/users/me/profile', newData);
      setProfileData(prev => ({
        ...prev,
        ...updated
      }));
      return { success: true };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: error.message };
    }
  };

  // Mock toggle admin for demo
  const toggleAdmin = async () => {
    try {
      const response = await api.post('/users/me/toggle-admin');
      if (response.success !== undefined) {
        setProfileData(prev => ({
          ...prev,
          is_admin: response.is_admin
        }));
      }
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.get('/logout'); // Assuming logout is a GET request based on backend routes/auth.py
      setProfileData(null);
      // Optional: window.location.href = '/signin'; or handle it in the component
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData, updateProfile, loading, toggleAdmin, logout }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;