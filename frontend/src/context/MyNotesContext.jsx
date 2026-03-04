import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../util/api';
import { useProfileContext } from './ProfileContext';

const MyNotesContext = createContext();

export const useMyNotesContext = () => {
  const context = useContext(MyNotesContext);
  if (!context) {
    throw new Error('useMyNotesContext must be used within MyNotesProvider');
  }
  return context;
};

export const MyNotesProvider = ({ children }) => {
  const { profileData } = useProfileContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_created');
  const [documents, setDocuments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyContent = async () => {
      if (profileData) {
        setLoading(true);
        try {
          // Fetch user's posts
          const docs = await api.get(`/users/${profileData.google_id}/posts`);
          setDocuments(docs.data || []);

          // Fetch user's discussions
          const discs = await api.get(`/users/${profileData.google_id}/discussions`);
          setDiscussions(discs.data || []);
        } catch (error) {
          console.error('Failed to fetch user content:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMyContent();
  }, [profileData]);

  return (
    <MyNotesContext.Provider value={{
      searchQuery, setSearchQuery,
      sortBy, setSortBy,
      documents, discussions,
      loading
    }}>
      {children}
    </MyNotesContext.Provider>
  );
};