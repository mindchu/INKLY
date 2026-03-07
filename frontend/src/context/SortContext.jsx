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
    const [sortBy, setSortBy] = useState('date');           // views | comments | likes | date
    const [includeTags, setIncludeTags] = useState([]);     // tags to include
    const [excludeTags, setExcludeTags] = useState([]);     // tags to exclude
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    const [rawContent, setRawContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 5;
    const lastFetchedSort = useRef(null);
    const lastFetchedSearch = useRef(null);

    const fetchRecommended = async (force = false, pageNum = 0) => {
        if (!force && lastFetchedSort.current === sortBy && lastFetchedSearch.current === null && pageNum === 0) return;

        lastFetchedSort.current = sortBy;
        lastFetchedSearch.current = null;
        setLoading(true);
        try {
            const params = new URLSearchParams();

            // Map sortBy to backend sort param
            const sortParam = sortBy === 'views' ? 'views'
                : sortBy === 'likes' ? 'likes'
                : sortBy === 'comments' ? 'comments'
                : 'recent'; // date
            params.append('sort', sortParam);
            params.append('skip', pageNum * limit);
            params.append('limit', limit);

            if (contentType) {
                params.append('type', contentType);
            }

            // Include tags filter
            if (includeTags.length > 0) {
                includeTags.forEach(tag => params.append('tags', tag));
            }

            // Exclude tags filter — passed as separate param
            if (excludeTags.length > 0) {
                excludeTags.forEach(tag => params.append('exclude_tags', tag));
            }

            const data = await api.get(`/content/recommended?${params.toString()}`);
            const fetchedItems = data.data || [];

            if (fetchedItems.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (pageNum === 0) {
                setRawContent(fetchedItems);
            } else {
                setRawContent(prev => [...prev, ...fetchedItems]);
            }
        } catch (error) {
            console.error('Failed to fetch recommended content:', error);
            if (pageNum === 0) lastFetchedSort.current = null;
        } finally {
            setLoading(false);
        }
    };

    const fetchSearch = async (query, pageNum = 0) => {
        if (!query.trim()) {
            setSearchQuery('');
            return fetchRecommended(true, 0);
        }

        lastFetchedSearch.current = query;
        lastFetchedSort.current = sortBy;
        setLoading(true);
        setSearchQuery(query);
        try {
            const params = new URLSearchParams();
            params.append('q', query);

            const sortParam = sortBy === 'views' ? 'views'
                : sortBy === 'likes' ? 'likes'
                : sortBy === 'comments' ? 'comments'
                : 'recent';
            params.append('sort_by', sortParam);
            params.append('scope', 'all');
            params.append('skip', pageNum * limit);
            params.append('limit', limit);

            if (contentType) {
                params.append('type', contentType);
            }
            if (includeTags.length > 0) {
                includeTags.forEach(tag => params.append('tags', tag));
            }
            if (excludeTags.length > 0) {
                excludeTags.forEach(tag => params.append('exclude_tags', tag));
            }

            const response = await api.get(`/search?${params.toString()}`);
            const fetchedItems = response.data || [];

            if (fetchedItems.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

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

    // Re-fetch when sortBy, includeTags, or excludeTags change
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        if (lastFetchedSearch.current) {
            fetchSearch(lastFetchedSearch.current, 0);
        } else {
            fetchRecommended(true, 0);
        }
    }, [sortBy, includeTags, excludeTags]);

    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchRecommended(true, 0);
    }, [contentType]);

    useEffect(() => {
        if (page > 0) {
            if (searchQuery) {
                fetchSearch(searchQuery, page);
            } else {
                fetchRecommended(true, page);
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