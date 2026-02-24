import React, { createContext, useContext, useState } from 'react';

const MyNotesContext = createContext();

export const useMyNotesContext = () => {
  const context = useContext(MyNotesContext);
  if (!context) {
    throw new Error('useMyNotesContext must be used within MyNotesProvider');
  }
  return context;
};

export const MyNotesProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_created');

  return (
    <MyNotesContext.Provider value={{ searchQuery, setSearchQuery, sortBy, setSortBy }}>
      {children}
    </MyNotesContext.Provider>
  );
};