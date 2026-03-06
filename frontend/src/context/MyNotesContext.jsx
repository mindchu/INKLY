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
  const [searchQuery, setSearchQuery] = useState(''); // Query sent to backend
  const [localSearch, setLocalSearch] = useState(''); // Query typed in input
  const [sortBy, setSortBy] = useState('date_created');
  const [documents, setDocuments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedSort = React.useRef(null);
  const lastFetchedSearch = React.useRef(null);

  const fetchRecommended = async (force = false) => {
    if (!profileData) return;
    if (!force && lastFetchedSort.current === sortBy && lastFetchedSearch.current === null) return;

    lastFetchedSort.current = sortBy;
    lastFetchedSearch.current = null;
    setLoading(true);
    try {
      // Maps to SortContext equivalents, though backend might use 'recent' by default
      // Here we just fetch user's documents; sorting is handled locally or we can modify the backend to accept sort for /users/...
      // Better yet, we just use the /search?scope=owned endpoint for both!

      const params = new URLSearchParams();
      params.append('sort_by', sortBy === 'most_recent' ? 'recent' : (sortBy === 'title_az' || sortBy === 'title_za' ? 'recent' : 'recent'));
      params.append('scope', 'owned');

      const response = await api.get(`/search?${params.toString()}`);

      // Separate posts and discussions
      const data = response.data || [];
      setDocuments(data.filter(item => item.type === 'post'));
      setDiscussions(data.filter(item => item.type === 'discussion'));

    } catch (error) {
      console.error('Failed to fetch user content:', error);
      lastFetchedSort.current = null;
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query) => {
    if (!profileData) return;
    if (!query.trim()) {
      setSearchQuery('');
      return fetchRecommended(true);
    }

    lastFetchedSearch.current = query;
    lastFetchedSort.current = sortBy;
    setLoading(true);
    setSearchQuery(query);
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('sort_by', sortBy === 'most_recent' ? 'recent' : 'recent');
      params.append('scope', 'owned');

      const response = await api.get(`/search?${params.toString()}`);

      const data = response.data || [];
      setDocuments(data.filter(item => item.type === 'post'));
      setDiscussions(data.filter(item => item.type === 'discussion'));
    } catch (error) {
      console.error('Failed to search user content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lastFetchedSearch.current) {
      fetchSearch(lastFetchedSearch.current);
    } else {
      fetchRecommended();
    }
  }, [sortBy, profileData]);

  // Handle initialization on page load
  useEffect(() => {
    if (profileData) {
      fetchRecommended(true);
    }
  }, [profileData]);

  // Apply sorting locally if it's title based, as backend may not support title_az sort natively
  const sortedDocuments = React.useMemo(() => {
    let sorted = [...documents];
    if (sortBy === 'title_az') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'title_za') {
      sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }
    return sorted;
  }, [documents, sortBy]);

  const sortedDiscussions = React.useMemo(() => {
    let sorted = [...discussions];
    if (sortBy === 'title_az') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'title_za') {
      sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }
    return sorted;
  }, [discussions, sortBy]);


  return (
    <MyNotesContext.Provider value={{
      searchQuery, localSearch, setLocalSearch, fetchSearch,
      sortBy, setSortBy,
      documents: sortedDocuments, discussions: sortedDiscussions,
      loading
    }}>
      {children}
    </MyNotesContext.Provider>
  );
};