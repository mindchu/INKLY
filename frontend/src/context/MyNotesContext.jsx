import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [includeTags, setIncludeTags] = useState([]);
  const [excludeTags, setExcludeTags] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedSearch = useRef(null);

  const buildParams = (currentSortBy, currentIncludeTags, currentExcludeTags, query = null) => {
    const params = new URLSearchParams();

    const sortParam = currentSortBy === 'views' ? 'views'
      : currentSortBy === 'likes' ? 'likes'
      : currentSortBy === 'comments' ? 'comments'
      : 'recent'; // 'date' -> 'recent'

    params.append('sort_by', sortParam);
    params.append('scope', 'owned');

    if (query) params.append('q', query);

    if (currentIncludeTags.length > 0) {
      currentIncludeTags.forEach(tag => params.append('tags', tag));
    }
    if (currentExcludeTags.length > 0) {
      currentExcludeTags.forEach(tag => params.append('exclude_tags', tag));
    }

    return params;
  };

  const fetchRecommended = async (currentSortBy = sortBy, currentIncludeTags = includeTags, currentExcludeTags = excludeTags) => {
    if (!profileData) return;
    setLoading(true);
    try {
      const params = buildParams(currentSortBy, currentIncludeTags, currentExcludeTags);
      const response = await api.get(`/search?${params.toString()}`);
      const data = response.data || [];
      setDocuments(data.filter(item => item.type === 'post'));
      setDiscussions(data.filter(item => item.type === 'discussion'));
    } catch (error) {
      console.error('Failed to fetch user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query, currentSortBy = sortBy, currentIncludeTags = includeTags, currentExcludeTags = excludeTags) => {
    if (!profileData) return;
    if (!query.trim()) {
      setSearchQuery('');
      lastFetchedSearch.current = null;
      return fetchRecommended(currentSortBy, currentIncludeTags, currentExcludeTags);
    }

    lastFetchedSearch.current = query;
    setSearchQuery(query);
    setLoading(true);
    try {
      const params = buildParams(currentSortBy, currentIncludeTags, currentExcludeTags, query);
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

  // Re-fetch whenever sort or tags change
  useEffect(() => {
    if (!profileData) return;
    if (lastFetchedSearch.current) {
      fetchSearch(lastFetchedSearch.current, sortBy, includeTags, excludeTags);
    } else {
      fetchRecommended(sortBy, includeTags, excludeTags);
    }
  }, [sortBy, includeTags, excludeTags, profileData]);

  return (
    <MyNotesContext.Provider value={{
      searchQuery, localSearch, setLocalSearch, fetchSearch,
      sortBy, setSortBy,
      includeTags, setIncludeTags,
      excludeTags, setExcludeTags,
      documents, discussions,
      loading
    }}>
      {children}
    </MyNotesContext.Provider>
  );
};