import React, { createContext, useContext, useState } from 'react';

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

    const toggleBookmark = (note) => {
        setBookmarkedNotes(prev => {
            const isBookmarked = prev.some(n => n.id === note.id);
            if (isBookmarked) {
                // Remove bookmark
                return prev.filter(n => n.id !== note.id);
            } else {
                // Add bookmark
                return [...prev, note];
            }
        });
    };

    const isBookmarked = (noteId) => {
        return bookmarkedNotes.some(note => note.id === noteId);
    };

    return (
        <BookmarksContext.Provider value={{ bookmarkedNotes, toggleBookmark, isBookmarked }}>
            {children}
        </BookmarksContext.Provider>
    );
};