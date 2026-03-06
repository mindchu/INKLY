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
    const lastFetchedSort = useRef(null);
    const lastFetchedSearch = useRef(null);

    const fetchRecommended = async (force = false) => {
        if (!force && lastFetchedSort.current === sortBy && lastFetchedSearch.current === null) return;

        lastFetchedSort.current = sortBy;
        lastFetchedSearch.current = null;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('sort', sortBy === 'hot' ? 'views' : (sortBy === 'top' ? 'likes' : 'recent'));
            if (contentType) {
                params.append('type', contentType);
            }
            const data = await api.get(`/content/recommended?${params.toString()}`);
            setRawContent(data.data || []);
        } catch (error) {
            console.error('Failed to fetch recommended content:', error);
            lastFetchedSort.current = null;
        } finally {
            setLoading(false);
        }
    };

    const fetchSearch = async (query) => {
        console.log("fetchSearch called with query:", query);
        if (!query.trim()) {
            setSearchQuery('');
            return fetchRecommended(true); // Return to recommended if empty search
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
            if (contentType) {
                params.append('type', contentType);
            }
            console.log("Sending search request to backend:", `/search?${params.toString()}`);
            const response = await api.get(`/search?${params.toString()}`);
            console.log("Received search response:", response);
            setRawContent(response.data || []);
        } catch (error) {
            console.error('Failed to search content:', error);
        } finally {
            setLoading(false);
        }
    };

    // Re-trigger the active fetch when sortBy changes
    useEffect(() => {
        if (lastFetchedSearch.current) {
            fetchSearch(lastFetchedSearch.current);
        } else {
            fetchRecommended();
        }
    }, [sortBy]);

    // Local filtering
    useEffect(() => {
        fetchRecommended(true);
    }, [contentType]);

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
            loading, fetchRecommended
        }}>
            {children}
        </SortContext.Provider>
    );
};