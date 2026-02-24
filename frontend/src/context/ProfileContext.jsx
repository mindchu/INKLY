import React, { createContext, useState, useContext } from 'react';
import { profileData as initialProfileData } from '../constants/Profile_data';

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
  const [profileData, setProfileData] = useState(initialProfileData);

  // Update profile data
  const updateProfile = (newData) => {
    setProfileData(prev => ({
      ...prev,
      ...newData
    }));
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;