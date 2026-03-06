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
    const [sortBy, setSortBy] = useState('hot');
    const [searchQuery, setSearchQuery] = useState(''); // Query sent to backend
    const [localSearch, setLocalSearch] = useState(''); // Query currently typed in input
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
            params.append('sort', sortBy === 'hot' ? 'views' : (sortBy === 'top' ? 'likes' : 'recent'));
            params.append('skip', pageNum * limit);
            params.append('limit', limit);
            if (contentType) {
                params.append('type', contentType);
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
        console.log("fetchSearch called with query:", query, "page:", pageNum);
        if (!query.trim()) {
            setSearchQuery('');
            return fetchRecommended(true, 0); // Return to recommended if empty search
        }

        lastFetchedSearch.current = query;
        lastFetchedSort.current = sortBy;
        setLoading(true);
        setSearchQuery(query);
        try {
            const params = new URLSearchParams();
            params.append('q', query);
            params.append('sort_by', sortBy === 'hot' ? 'views' : (sortBy === 'top' ? 'likes' : 'recent'));
            params.append('scope', 'all');
            params.append('skip', pageNum * limit);
            params.append('limit', limit);
            if (contentType) {
                params.append('type', contentType);
            }
            console.log("Sending search request to backend:", `/search?${params.toString()}`);
            const response = await api.get(`/search?${params.toString()}`);
            console.log("Received search response:", response);

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

    // Re-trigger the active fetch when sortBy changes
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        if (lastFetchedSearch.current) {
            fetchSearch(lastFetchedSearch.current, 0);
        } else {
            fetchRecommended(false, 0);
        }
    }, [sortBy]);

    // Local filtering
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchRecommended(true, 0);
    }, [contentType]);

    // Fetch next page when page state changes
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
            searchQuery, localSearch, setLocalSearch, fetchSearch,
            content, setContent: setRawContent,
            loading, fetchRecommended,
            page, setPage, hasMore
        }}>
            {children}
        </SortContext.Provider>
    );
};