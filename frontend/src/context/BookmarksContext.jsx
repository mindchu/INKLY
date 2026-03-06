import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../util/api';
import { useProfileContext } from './ProfileContext';

const BookmarksContext = createContext();

export const useBookmarks = () => {
    const context = useContext(BookmarksContext);
    if (!context) {
        throw new Error('useBookmarks must be used within BookmarksProvider');
    }
    return context;
};

export const BookmarksProvider = ({ children }) => {
    const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const { profileData } = useProfileContext();
    const lastFetchedId = React.useRef(null);

    const lastFetchedSearch = React.useRef(null);

    const fetchBookmarks = async (force = false) => {
        const currentId = profileData?.google_id || profileData?._id;
        if (!currentId) {
            setBookmarkedNotes([]);
            lastFetchedId.current = null;
            return;
        }

        if (!force && lastFetchedId.current === currentId && lastFetchedSearch.current === null) return;

        lastFetchedId.current = currentId;
        lastFetchedSearch.current = null;
        setLoading(true);
        try {
            const response = await api.get('/search?scope=bookmarks&sort_by=recent');
            setBookmarkedNotes(response.data || []);
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
            lastFetchedId.current = null;
        } finally {
            setLoading(false);
        }
    };

    const fetchSearch = async (query) => {
        const currentId = profileData?.google_id || profileData?._id;
        if (!currentId) return;

        if (!query.trim()) {
            setSearchQuery('');
            return fetchBookmarks(true);
        }

        lastFetchedSearch.current = query;
        lastFetchedId.current = currentId;
        setLoading(true);
        setSearchQuery(query);
        try {
            const params = new URLSearchParams();
            params.append('q', query);
            params.append('sort_by', 'recent');
            params.append('scope', 'bookmarks');

            const response = await api.get(`/search?${params.toString()}`);
            setBookmarkedNotes(response.data || []);
        } catch (error) {
            console.error('Failed to search bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lastFetchedSearch.current) {
            fetchSearch(lastFetchedSearch.current);
        } else {
            fetchBookmarks()
        }
    }, [profileData]);

    const toggleBookmark = async (note) => {
        try {
            const response = await api.post(`/bookmarks/${note._id || note.id}`);
            if (response.success) {
                if (response.is_bookmarked) {
                    setBookmarkedNotes(prev => [...prev, note]);
                } else {
                    setBookmarkedNotes(prev => prev.filter(n => (n._id || n.id) !== (note._id || note.id)));
                }
            }
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        }
    };

    const isBookmarked = (noteId) => {
        return bookmarkedNotes.some(note => (note._id || note.id) === noteId);
    };

    return (
        <BookmarksContext.Provider value={{
            bookmarkedNotes,
            toggleBookmark,
            isBookmarked,
            searchQuery,
            localSearch,
            setLocalSearch,
            fetchSearch,
            loading
        }}>
            {children}
        </BookmarksContext.Provider>
    );
};