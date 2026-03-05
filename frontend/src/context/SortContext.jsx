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

export const SortProvider = ({ children }) => {
    const [sortBy, setSortBy] = useState('hot');
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const lastFetchedSort = useRef(null);

    const fetchRecommended = async (force = false) => {
        if (!force && lastFetchedSort.current === sortBy) return;

        lastFetchedSort.current = sortBy;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('sort', sortBy === 'hot' ? 'views' : (sortBy === 'top' ? 'likes' : 'recent'));
            const data = await api.get(`/content/recommended?${params.toString()}`);
            setContent(data.data || []);
        } catch (error) {
            console.error('Failed to fetch recommended content:', error);
            lastFetchedSort.current = null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommended();
    }, [sortBy]);

    return (
        <SortContext.Provider value={{ sortBy, setSortBy, content, setContent, loading, fetchRecommended }}>
            {children}
        </SortContext.Provider>
    );
};