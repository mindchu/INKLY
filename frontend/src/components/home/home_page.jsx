import React, { useState, useMemo } from 'react'
import { GiPlainCircle } from "react-icons/gi";
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
import { LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import { otherNotes } from '../../constants/Others_note_data';
import { useBookmarks } from '../../context/BookmarksContext';
import { useSortContext } from '../../context/SortContext';
import NoteModal from './NoteModal';

const Home_page = () => {
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const { sortBy } = useSortContext();

    // State for modal
    const [selectedNote, setSelectedNote] = useState(null);

    // State to track likes for each note
    const [noteLikes, setNoteLikes] = useState(() => {
        // Initialize with original like counts
        const initialLikes = {};
        otherNotes.forEach(note => {
            initialLikes[note.id] = {
                count: note.likes,
                isLiked: false
            };
        });
        return initialLikes;
    });

    // Helper function to format large numbers (e.g., 1132 -> 1.1k)
    const formatViews = (views) => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return views.toString();
    };

    // Handle like button click
    const handleLike = (noteId, e) => {
        e.stopPropagation(); // Prevent card click
        setNoteLikes(prev => ({
            ...prev,
            [noteId]: {
                count: prev[noteId].isLiked ? prev[noteId].count - 1 : prev[noteId].count + 1,
                isLiked: !prev[noteId].isLiked
            }
        }));
    };

    // Handle bookmark click
    const handleBookmark = (note, e) => {
        e.stopPropagation(); // Prevent card click
        toggleBookmark(note);
    };

    // Handle card click to open modal
    const handleCardClick = (note) => {
        setSelectedNote(note);
    };

    // Close modal
    const handleCloseModal = () => {
        setSelectedNote(null);
    };

    // Sort notes based on sortBy state
    const sortedNotes = useMemo(() => {
        const notesCopy = [...otherNotes];

        switch (sortBy) {
            case 'hot':
                // Sort by views (highest to lowest)
                return notesCopy.sort((a, b) => b.views - a.views);

            case 'top':
                // Sort by likes (highest to lowest), using current like counts
                return notesCopy.sort((a, b) => {
                    const aLikes = noteLikes[a.id]?.count || a.likes;
                    const bLikes = noteLikes[b.id]?.count || b.likes;
                    return bLikes - aLikes;
                });

            case 'new':
                // Sort by date (newest first) - assuming notes have a date field
                // If you don't have a date field, you can sort by ID (higher ID = newer)
                return notesCopy.sort((a, b) => b.id - a.id);

            default:
                return notesCopy;
        }
    }, [sortBy, noteLikes]);

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto relative'>
            {/* Blur overlay - only shows when modal is open */}
            {selectedNote && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-white/30 z-10"
                    onClick={handleCloseModal}
                />
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 ${selectedNote ? 'relative z-0' : ''}`}>
                {sortedNotes.map((note) => (
                    <div
                        key={note.id}
                        className='bg-white rounded-xl p-6 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow'
                        onClick={() => handleCardClick(note)}
                    >
                        {/* Title */}
                        <h3 className='text-lg font-semibold text-gray-800 mb-3'>{note.title}</h3>

                        {/* Author */}
                        <div className='flex items-center gap-2 mb-3'>
                            <div className='w-6 h-6 bg-green-600 rounded-full'></div>
                            <span className='text-sm font-medium text-gray-700'>{note.author}</span>
                        </div>

                        {/* Description */}
                        <p className='text-sm text-gray-600 mb-4 grow line-clamp-3'>
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
                                    onClick={(e) => handleLike(note.id, e)}
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
                                <button
                                    onClick={(e) => handleBookmark(note, e)}
                                    className='hover:text-yellow-500 transition cursor-pointer'
                                >
                                    {isBookmarked(note.id) ? (
                                        <BsBookmarkDashFill size={16} className='text-yellow-400' />
                                    ) : (
                                        <LuBookmarkMinus size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedNote && (
                <NoteModal note={selectedNote} onClose={handleCloseModal} />
            )}
        </div>
    )
}

export default Home_page