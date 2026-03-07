import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../util/api';

const SortContext = createContext();

export const useSortContext = () => {
    const context = useContext(SortContext);
    if (!context) {
        throw new Error('useSortContext must be used within SortProvider');
    }
    return context;
};

export const SortProvider = ({ children, contentType }) => {
    const [sortBy, setSortBy] = useState('date');
    const [includeTags, setIncludeTags] = useState([]);
    const [excludeTags, setExcludeTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    const [rawContent, setRawContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 5;
    const lastFetchedSearch = useRef(null);

    // FIX: Accept current values as params to avoid stale closure
    const fetchRecommended = async (pageNum = 0, currentSortBy = sortBy, currentIncludeTags = includeTags, currentExcludeTags = excludeTags) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            const sortParam = currentSortBy === 'views' ? 'views'
                : currentSortBy === 'likes' ? 'likes'
                : currentSortBy === 'comments' ? 'comments'
                : 'recent';
            params.append('sort', sortParam);
            params.append('skip', pageNum * limit);
            params.append('limit', limit);

            if (contentType) {
                params.append('type', contentType);
            }

            // Send tags as-is, backend handles case-insensitive matching
            if (currentIncludeTags.length > 0) {
                currentIncludeTags.forEach(tag => params.append('tags', tag));
            }
            if (currentExcludeTags.length > 0) {
                currentExcludeTags.forEach(tag => params.append('exclude_tags', tag));
            }

            const data = await api.get(`/content/recommended?${params.toString()}`);
            const fetchedItems = data.data || [];

            setHasMore(fetchedItems.length >= limit);

            if (pageNum === 0) {
                setRawContent(fetchedItems);
            } else {
                setRawContent(prev => [...prev, ...fetchedItems]);
            }
        } catch (error) {
            console.error('Failed to fetch recommended content:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSearch = async (query, pageNum = 0, currentSortBy = sortBy, currentIncludeTags = includeTags, currentExcludeTags = excludeTags) => {
        if (!query.trim()) {
            setSearchQuery('');
            return fetchRecommended(0, currentSortBy, currentIncludeTags, currentExcludeTags);
        }

        lastFetchedSearch.current = query;
        setLoading(true);
        setSearchQuery(query);
        try {
            const params = new URLSearchParams();
            params.append('q', query);

            const sortParam = currentSortBy === 'views' ? 'views'
                : currentSortBy === 'likes' ? 'likes'
                : currentSortBy === 'comments' ? 'comments'
                : 'recent';
            params.append('sort_by', sortParam);
            params.append('scope', 'all');
            params.append('skip', pageNum * limit);
            params.append('limit', limit);

            if (contentType) {
                params.append('type', contentType);
            }
            if (currentIncludeTags.length > 0) {
                currentIncludeTags.forEach(tag => params.append('tags', tag));
            }
            if (currentExcludeTags.length > 0) {
                currentExcludeTags.forEach(tag => params.append('exclude_tags', tag));
            }

            const response = await api.get(`/search?${params.toString()}`);
            const fetchedItems = response.data || [];

            setHasMore(fetchedItems.length >= limit);

            if (pageNum === 0) {
                setRawContent(fetchedItems);
            } else {
                setRawContent(prev => [...prev, ...fetchedItems]);
            }
        } catch (error) {
            console.error('Failed to search content:', error);
        } finally {
            setLoading(false);
        }
    };

    // FIX: Pass current state values directly into fetch functions
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        if (lastFetchedSearch.current) {
            fetchSearch(lastFetchedSearch.current, 0, sortBy, includeTags, excludeTags);
        } else {
            fetchRecommended(0, sortBy, includeTags, excludeTags);
        }
    }, [sortBy, includeTags, excludeTags]);

    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchRecommended(0, sortBy, includeTags, excludeTags);
    }, [contentType]);

    useEffect(() => {
        if (page > 0) {
            if (searchQuery) {
                fetchSearch(searchQuery, page, sortBy, includeTags, excludeTags);
            } else {
                fetchRecommended(page, sortBy, includeTags, excludeTags);
            }
        }
    }, [page]);

    const content = React.useMemo(() => {
        if (!localSearch.trim() || localSearch === searchQuery) {
            return rawContent;
        }
        const lowerQuery = localSearch.toLowerCase();
        return rawContent.filter(item => item.title?.toLowerCase().includes(lowerQuery));
    }, [rawContent, localSearch, searchQuery]);

    return (
        <SortContext.Provider value={{
            sortBy, setSortBy,
            includeTags, setIncludeTags,
            excludeTags, setExcludeTags,
            searchQuery, localSearch, setLocalSearch, fetchSearch,
            content, setContent: setRawContent,
            loading, fetchRecommended,
            page, setPage, hasMore
        }}>
            {children}
        </SortContext.Provider>
    );
};