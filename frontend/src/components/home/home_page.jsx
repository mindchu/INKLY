import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
import { LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';
import { useSortContext } from '../../context/SortContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';
import { getMediaUrl } from '../../config';
import ShareButton from '../button/ShareButton';


const Home_page = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const { sortBy, content: notes, loading, setContent: setNotes, page, setPage, hasMore } = useSortContext();

    const observer = useRef();
    const lastNoteElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && Array.isArray(notes) && notes.length > 0 && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const formatViews = (views) => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return views ? views.toString() : '0';
    };

    const handleLike = async (noteId, e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/content/${noteId}/like`);
            if (response.success) {
                setNotes(prev => prev.map(note => {
                    if ((note._id || note.id) === noteId) {
                        return {
                            ...note,
                            is_liked: response.is_liked,
                            like_count: response.is_liked ? (note.like_count || 0) + 1 : (note.like_count || 1) - 1
                        };
                    }
                    return note;
                }));
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleBookmark = (note, e) => {
        e.stopPropagation();
        toggleBookmark(note);
    };

    const handleCardClick = (note) => {
        navigate(`/content/${note._id || note.id}`, { state: { from: location.pathname } });
    };

    if (loading && notes.length === 0) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading notes...</div>
            </div>
        );
    }

    return (
        // pb-[76px] on mobile so content won't hide behind the fixed tab bar
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto relative pb-[76px] md:pb-0'>

            {/* 1 col on mobile, 2 on sm, 3 on lg */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8`}>
                {notes.map((note, index) => {
                    const isTriggerNote = index === Math.max(0, notes.length - 3);
                    return (
                        <div
                            ref={isTriggerNote ? lastNoteElementRef : null}
                            key={note._id || note.id}
                            className='bg-white rounded-xl p-4 md:p-6 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]'
                            onClick={() => handleCardClick(note)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className='text-base md:text-lg font-semibold text-gray-800 flex-1 pr-2 line-clamp-2'>{note.title}</h3>
                                {note.type && (
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider flex-shrink-0 ${note.type === 'post'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                                        }`}>
                                        {note.type === 'post' ? 'Note' : 'Discussion'}
                                    </span>
                                )}
                            </div>

                            <div className='flex items-center gap-2 mb-3'>
                                {note.author_profile_picture_url ? (
                                    <img
                                        src={getMediaUrl(note.author_profile_picture_url)}
                                        alt={note.author_username}
                                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0'>
                                        {note.author_username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className='text-sm font-medium text-gray-700 flex items-center gap-2 min-w-0'>
                                    <span className='truncate'>{note.author_username || 'Unknown'}</span>
                                    <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                </span>
                            </div>

                            <div className="flex gap-3 mb-4 flex-grow">
                                <p className='text-sm text-gray-600 line-clamp-3 flex-1'>
                                    {note.text}
                                </p>
                                {note.file_paths?.some(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase())) && (
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                        <img
                                            src={getMediaUrl(`/uploads/${note.file_paths.find(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase()))}`)}
                                            alt="Thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            {note.file_paths?.length > 0 && (
                                <div className='mb-4'>
                                    <span className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                                        📎 {note.file_paths.length} Attachment(s)
                                    </span>
                                </div>
                            )}

                            <div className='flex flex-wrap gap-1.5 mb-4'>
                                {note.tags?.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className='text-xs text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full font-medium'
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className='border-t border-gray-200 mb-3'></div>

                            <div className='flex items-center justify-between text-sm text-gray-600'>
                                <div className='flex items-center gap-3'>
                                    <button
                                        onClick={(e) => handleLike(note._id || note.id, e)}
                                        className='flex items-center gap-1 hover:text-red-500 transition cursor-pointer'
                                    >
                                        {note.is_liked ? (
                                            <IoHeart size={16} className='text-red-500' />
                                        ) : (
                                            <IoHeartOutline size={16} />
                                        )}
                                        <span className={note.is_liked ? 'text-red-500' : ''}>
                                            {note.like_count || 0}
                                        </span>
                                    </button>
                                    <div className='flex items-center gap-1'>
                                        <PiChatText size={16} />
                                        <span>{note.comments_count || 0}</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <LuEye size={16} />
                                        <span>{formatViews(note.views)}</span>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <ShareButton
                                        targetId={note._id || note.id}
                                        title={note.title}
                                        text={note.text?.substring(0, 100) || 'Check out this discussion'}
                                    />
                                    <button
                                        onClick={(e) => handleBookmark(note, e)}
                                        className='hover:text-yellow-500 transition cursor-pointer'
                                    >
                                        {isBookmarked(note._id || note.id) ? (
                                            <BsBookmarkDashFill size={16} className='text-yellow-400' />
                                        ) : (
                                            <LuBookmarkMinus size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && notes.length > 0 && (
                <div className="w-full flex justify-center pb-8">
                    <p className="text-gray-500 font-['Inter'] animate-pulse">Loading more...</p>
                </div>
            )}
            {!hasMore && notes.length > 0 && (
                <div className="w-full flex justify-center pb-8">
                    <p className="text-gray-400 font-['Inter'] text-sm">You've reached the end!</p>
                </div>
            )}
        </div>
    )
}

export default Home_page