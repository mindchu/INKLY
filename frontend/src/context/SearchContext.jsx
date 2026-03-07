import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../util/api';


const SearchContext = createContext();

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within SearchProvider');
    }
    return context;
};

export const SearchProvider = ({ children }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        sort: 'recent',
        tags: [],
        exclude_tags: [],
        type: 'all'
    });
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 5;
    const [allTags, setAllTags] = useState([]);
    const fetchedTags = React.useRef(false);

    useEffect(() => {
        const fetchTags = async () => {
            if (fetchedTags.current) return;
            fetchedTags.current = true;
            try {
                const res = await api.get('/tags/all');
                if (res.tags) {
                    setAllTags(res.tags);
                }
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                fetchedTags.current = false;
            }
        };
        fetchTags();
    }, []);

    const performSearch = useCallback(async (searchQuery = query, searchFilters = filters, pageNum = 0) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (searchFilters.tags.length > 0) {
                searchFilters.tags.forEach(tag => params.append('tags', tag));
            }
            if (searchFilters.exclude_tags && searchFilters.exclude_tags.length > 0) {
                searchFilters.exclude_tags.forEach(tag => params.append('exclude_tags', tag));
            }
            params.append('sort_by', searchFilters.sort);
            if (searchFilters.type !== 'all') {
                params.append('type', searchFilters.type);
            }
            params.append('skip', pageNum * limit);
            params.append('limit', limit);

            const data = await api.get(`/search?${params.toString()}`);
            if (data.data) {
                const fetchedItems = data.data;

                if (fetchedItems.length < limit) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (pageNum === 0) {
                    setResults(fetchedItems);
                } else {
                    setResults(prev => [...prev, ...fetchedItems]);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    }, [query, filters]);

    useEffect(() => {
        setPage(0);
        setHasMore(true);
    }, [query, filters]);

    useEffect(() => {
        if (page > 0) {
            performSearch(query, filters, page);
        }
    }, [page]);

    return (
        <SearchContext.Provider value={{
            query, setQuery,
            results, setResults,
            loading, performSearch,
            filters, setFilters,
            allTags,
            page, setPage, hasMore
        }}>
            {children}
        </SearchContext.Provider>
    );
};