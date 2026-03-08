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
    const [includeTags, setIncludeTags] = useState([]);
    const [excludeTags, setExcludeTags] = useState([]);
    const [sortBy, setSortBy] = useState('date');
    const { profileData } = useProfileContext();
    const lastFetchedId = React.useRef(null);
    const lastFetchedSearch = React.useRef(null);

    // Map frontend sort keys → backend sort_by values
    const getSortParam = (sort) => {
        switch (sort) {
            case 'views':    return 'views';
            case 'comments': return 'comments';
            case 'likes':    return 'likes';
            case 'date':     return 'recent';
            default:         return 'recent';
        }
    };

    const buildParams = (query = '', sort = sortBy, incTags = includeTags, excTags = excludeTags) => {
        const params = new URLSearchParams();
        if (query.trim()) params.append('q', query.trim());
        params.append('sort_by', getSortParam(sort));
        params.append('scope', 'bookmarks');
        incTags.forEach(tag => params.append('tags', tag));
        excTags.forEach(tag => params.append('exclude_tags', tag));
        return params.toString();
    };

    const fetchBookmarks = async (force = false, sort = sortBy, incTags = includeTags, excTags = excludeTags) => {
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
            const response = await api.get(`/search?${buildParams('', sort, incTags, excTags)}`);
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
            const response = await api.get(`/search?${buildParams(query)}`);
            setBookmarkedNotes(response.data || []);
        } catch (error) {
            console.error('Failed to search bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch from backend whenever sort or tags change
    useEffect(() => {
        const currentId = profileData?.google_id || profileData?._id;
        if (!currentId) return;
        if (lastFetchedSearch.current) {
            fetchSearch(lastFetchedSearch.current);
        } else {
            fetchBookmarks(true, sortBy, includeTags, excludeTags);
        }
    }, [sortBy, includeTags, excludeTags]);

    // Re-fetch when profile changes
    useEffect(() => {
        if (lastFetchedSearch.current) {
            fetchSearch(lastFetchedSearch.current);
        } else {
            fetchBookmarks();
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
            setBookmarkedNotes,
            toggleBookmark,
            isBookmarked,
            searchQuery,
            localSearch,
            setLocalSearch,
            fetchSearch,
            loading,
            sortBy,
            setSortBy,
            includeTags,
            setIncludeTags,
            excludeTags,
            setExcludeTags,
        }}>
            {children}
        </BookmarksContext.Provider>
    );
};