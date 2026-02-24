import React, { useState, useMemo } from 'react'
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
import { BsBookmarkDashFill } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';

const Bookmarks_page = () => {
    const { bookmarkedNotes, toggleBookmark } = useBookmarks();
    
    // Local sort state
    const [sortBy, setSortBy] = useState('most_recent');
    
    // State to track likes for each note
    const [noteLikes, setNoteLikes] = useState(() => {
        const initialLikes = {};
        bookmarkedNotes.forEach(note => {
            initialLikes[note.id] = {
                count: note.likes,
                isLiked: false
            };
        });
        return initialLikes;
    });

    // Helper function to format large numbers
    const formatViews = (views) => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return views.toString();
    };

    // Handle like button click
    const handleLike = (noteId) => {
        setNoteLikes(prev => ({
            ...prev,
            [noteId]: {
                count: prev[noteId]?.isLiked ? prev[noteId].count - 1 : (prev[noteId]?.count || bookmarkedNotes.find(n => n.id === noteId)?.likes || 0) + 1,
                isLiked: !prev[noteId]?.isLiked
            }
        }));
    };

    // Sort bookmarked notes
    const sortedNotes = useMemo(() => {
        let sorted = [...bookmarkedNotes];
        
        switch (sortBy) {
            case 'date_created':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'most_recent':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'title_az':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title_za':
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        
        return sorted;
    }, [bookmarkedNotes, sortBy]);

    if (bookmarkedNotes.length === 0) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-center'>
                    <BsBookmarkDashFill size={64} className='text-gray-300 mx-auto mb-4' />
                    <h2 className='text-2xl font-semibold text-gray-600 mb-2'>No Bookmarks Yet</h2>
                    <p className='text-gray-500'>Start bookmarking notes to see them here!</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8'>
                {sortedNotes.map((note) => (
                    <div key={note.id} className='bg-white rounded-xl p-6 shadow-sm flex flex-col relative'>
                        {/* Bookmark indicator in top right */}
                        <button 
                            onClick={() => toggleBookmark(note)}
                            className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition'
                        >
                            <BsBookmarkDashFill size={20} className='text-yellow-400' />
                        </button>

                        {/* Title */}
                        <h3 className='text-lg font-semibold text-gray-800 mb-3 pr-8'>{note.title}</h3>
                        
                        {/* Author */}
                        <div className='flex items-center gap-2 mb-3'>
                            <div className='w-6 h-6 bg-green-600 rounded-full'></div>
                            <span className='text-sm font-medium text-gray-700'>{note.author}</span>
                        </div>

                        {/* Description */}
                        <p className='text-sm text-gray-600 mb-4 flex-grow line-clamp-3'>
                            {note.description}
                        </p>

                        {/* Attachments */}
                        {note.attachments > 0 && (
                            <div className='mb-4'>
                                <span className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                                    📎 {note.attachments} Attachment(s)
                                </span>
                            </div>
                        )}

                        {/* Tags */}
                        <div className='flex flex-wrap gap-2 mb-4'>
                            {note.tags.map((tag, tagIndex) => (
                                <span
                                    key={tagIndex}
                                    className='text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium'
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className='border-t border-gray-200 mb-4'></div>

                        {/* Stats and Actions */}
                        <div className='flex items-center justify-between text-sm text-gray-600'>
                            <div className='flex items-center gap-4'>
                                <button 
                                    onClick={() => handleLike(note.id)}
                                    className='flex items-center gap-1 hover:text-red-500 transition cursor-pointer'
                                >
                                    {noteLikes[note.id]?.isLiked ? (
                                        <IoHeart size={16} className='text-red-500' />
                                    ) : (
                                        <IoHeartOutline size={16} />
                                    )}
                                    <span className={noteLikes[note.id]?.isLiked ? 'text-red-500' : ''}>
                                        {noteLikes[note.id]?.count || note.likes}
                                    </span>
                                </button>
                                <div className='flex items-center gap-1'>
                                    <PiChatText size={16} />
                                    <span>{note.comments}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <LuEye size={16} />
                                    <span>{formatViews(note.views)}</span>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <button className='hover:text-gray-800 transition'>
                                    <MdOutlineFileDownload size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Bookmarks_page