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
        sort: 'hot',
        tags: [],
        exclude_tags: [],
        type: 'all'
    });
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await api.get('/tags/all');
                if (res.tags) {
                    setAllTags(res.tags);
                }
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        fetchTags();
    }, []);

    const performSearch = useCallback(async (searchQuery = query, searchFilters = filters) => {
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

            const data = await api.get(`/search?${params.toString()}`);
            if (data.data) {
                setResults(data.data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    }, [query, filters]);

    return (
        <SearchContext.Provider value={{
            query, setQuery,
            results, setResults,
            loading, performSearch,
            filters, setFilters,
            allTags
        }}>
            {children}
        </SearchContext.Provider>
    );
};
