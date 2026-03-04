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
    const { profileData } = useProfileContext();

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (profileData) {
                try {
                    const data = await api.get('/bookmarks');
                    setBookmarkedNotes(data.data || []);
                } catch (error) {
                    console.error('Failed to fetch bookmarks:', error);
                }
            } else {
                setBookmarkedNotes([]);
            }
        };
        fetchBookmarks();
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
        <BookmarksContext.Provider value={{ bookmarkedNotes, toggleBookmark, isBookmarked }}>
            {children}
        </BookmarksContext.Provider>
    );
};