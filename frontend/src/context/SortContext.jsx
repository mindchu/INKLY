import React, { createContext, useContext, useState } from 'react';

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

    return (
        <SortContext.Provider value={{ sortBy, setSortBy }}>
            {children}
        </SortContext.Provider>
    );
};