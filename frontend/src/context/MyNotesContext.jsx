import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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

export const MyNotesProvider = ({ children, defaultType }) => {
  const { profileData } = useProfileContext();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [includeTags, setIncludeTags] = useState([]);
  const [excludeTags, setExcludeTags] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ total_count: 0, note_count: 0, discussion_count: 0, total_views: 0, total_likes: 0 });
  const limit = 20;
  const lastFetchedSearch = useRef(null);

  // Handle force refresh from sidebar
  useEffect(() => {
    if (location.state?.refresh) {
      const isAtDefault = sortBy === 'date' &&
        includeTags.length === 0 &&
        excludeTags.length === 0 &&
        searchQuery === '';

      if (isAtDefault) {
        fetchRecommended(0, 'date', [], []);
      } else {
        setSearchQuery('');
        setLocalSearch('');
        setSortBy('date');
        setIncludeTags([]);
        setExcludeTags([]);
        setPage(0);
        lastFetchedSearch.current = null;
      }
    }
  }, [location.state?.refresh]);

  const buildParams = (currentSortBy, currentIncludeTags, currentExcludeTags, query = null, pageNum = 0) => {
    const params = new URLSearchParams();

    const sortParam = currentSortBy === 'views' ? 'views'
      : currentSortBy === 'likes' ? 'likes'
        : currentSortBy === 'comments' ? 'comments'
          : 'recent';

    params.append('sort_by', sortParam);
    params.append('scope', 'owned');
    params.append('skip', pageNum * limit);
    params.append('limit', limit);

    if (defaultType) params.append('type', defaultType);
    if (query) params.append('q', query);

    if (currentIncludeTags.length > 0) {
      currentIncludeTags.forEach(tag => params.append('tags', tag));
    }
    if (currentExcludeTags.length > 0) {
      currentExcludeTags.forEach(tag => params.append('exclude_tags', tag));
    }

    return params;
  };

  const fetchRecommended = async (pageNum = 0, currentSortBy = sortBy, currentIncludeTags = includeTags, currentExcludeTags = excludeTags) => {
    if (!profileData) return;
    setLoading(true);
    try {
      const params = buildParams(currentSortBy, currentIncludeTags, currentExcludeTags, null, pageNum);
      const response = await api.get(`/search?${params.toString()}`);
      const data = response.data || [];
      const newStats = response.stats || { total_count: 0, note_count: 0, discussion_count: 0, total_views: 0, total_likes: 0 };

      setHasMore(data.length >= limit);
      setStats(newStats);

      if (pageNum === 0) {
        setDocuments(data.filter(item => item.type === 'post'));
        setDiscussions(data.filter(item => item.type === 'discussion'));
      } else {
        setDocuments(prev => [...prev, ...data.filter(item => item.type === 'post')]);
        setDiscussions(prev => [...prev, ...data.filter(item => item.type === 'discussion')]);
      }
    } catch (error) {
      console.error('Failed to fetch user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query, pageNum = 0, currentSortBy = sortBy, currentIncludeTags = includeTags, currentExcludeTags = excludeTags) => {
    if (!profileData) return;
    if (!query.trim()) {
      setSearchQuery('');
      lastFetchedSearch.current = null;
      return fetchRecommended(0, currentSortBy, currentIncludeTags, currentExcludeTags);
    }

    lastFetchedSearch.current = query;
    setSearchQuery(query);
    setLoading(true);
    try {
      const params = buildParams(currentSortBy, currentIncludeTags, currentExcludeTags, query, pageNum);
      const response = await api.get(`/search?${params.toString()}`);
      const data = response.data || [];
      const newStats = response.stats || { total_count: 0, note_count: 0, discussion_count: 0, total_views: 0, total_likes: 0 };

      setHasMore(data.length >= limit);
      setStats(newStats);

      if (pageNum === 0) {
        setDocuments(data.filter(item => item.type === 'post'));
        setDiscussions(data.filter(item => item.type === 'discussion'));
      } else {
        setDocuments(prev => [...prev, ...data.filter(item => item.type === 'post')]);
        setDiscussions(prev => [...prev, ...data.filter(item => item.type === 'discussion')]);
      }
    } catch (error) {
      console.error('Failed to search user content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever sort or tags change
  useEffect(() => {
    if (!profileData) return;
    setPage(0);
    setHasMore(true);
    if (lastFetchedSearch.current) {
      fetchSearch(lastFetchedSearch.current, 0, sortBy, includeTags, excludeTags);
    } else {
      fetchRecommended(0, sortBy, includeTags, excludeTags);
    }
  }, [sortBy, includeTags, excludeTags, profileData]);

  // Handle pagination
  useEffect(() => {
    if (page > 0) {
      if (lastFetchedSearch.current) {
        fetchSearch(lastFetchedSearch.current, page, sortBy, includeTags, excludeTags);
      } else {
        fetchRecommended(page, sortBy, includeTags, excludeTags);
      }
    }
  }, [page]);

  return (
    <MyNotesContext.Provider value={{
      searchQuery, localSearch, setLocalSearch, fetchSearch,
      sortBy, setSortBy,
      includeTags, setIncludeTags,
      excludeTags, setExcludeTags,
      documents, discussions,
      loading, page, setPage, hasMore, stats,
      defaultType
    }}>
      {children}
    </MyNotesContext.Provider>
  );
};