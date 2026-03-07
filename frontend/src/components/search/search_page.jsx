import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { GiPlainCircle } from "react-icons/gi";
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
import { BsBookmarkDashFill, BsBookmarkDash } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';
import { useSearch } from '../../context/SearchContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';

const Search_page = () => {
    const { results, loading, setResults, page, setPage, hasMore } = useSearch();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const navigate = useNavigate();

    const observer = useRef();
    const lastResultElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && Array.isArray(results) && results.length > 0 && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleCardClick = (note) => {
        navigate(`/content/${note._id || note.id}`);
    };

    const formatViews = (views) => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return views.toString();
    };

    const handleLike = async (postId, e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/content/${postId}/like`);
            if (response.success) {
                setResults(prev => prev.map(note => {
                    if ((note._id || note.id) === postId) {
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

    if (loading && results.length === 0) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <p className='font-[Inter] text-xl animate-pulse'>Searching...</p>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto p-8'>
            {results.length === 0 && !loading && (
                <div className='w-full flex justify-center py-20'>
                    <p className='font-[Inter] text-xl text-gray-500'>No results found.</p>
                </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {results.map((note, index) => {
                    const isTriggerResult = index === Math.max(0, results.length - 3);
                    return (
                        <div
                            ref={isTriggerResult ? lastResultElementRef : null}
                            key={note._id || note.id}
                            className='flex w-full h-auto rounded-[16px] bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                            onClick={() => handleCardClick(note)}
                        >
                            <div className='w-full'>
                                <p className='font-[Inter] text-[20px] text-[#124C09] font-semibold'>
                                    {note.title}
                                </p>
                                <div className='mt-[16px] flex flex-row items-center gap-[10px]'>
                                    {note.author_profile_picture_url ? (
                                        <img
                                            src={note.author_profile_picture_url.startsWith('http') ? note.author_profile_picture_url : `${import.meta.env.VITE_API_URL || 'http://localhost:6001/api'}${note.author_profile_picture_url.replace('/api', '')}`}
                                            alt={note.author_username}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className='w-6 h-6 rounded-full bg-[#577F4E] flex items-center justify-center text-[10px] text-white font-bold'>
                                            {note.author_username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <p className='font-[Inter] text-[18px] text-[#124C09] font-semibold flex items-center gap-2'>
                                        {note.author_username || 'Unknown'}
                                        <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                    </p>
                                </div>
                                <p className='mt-[12px] font-[Inter] text-[14px] text-[#124C09] font-medium line-clamp-3'>
                                    {note.text}
                                </p>

                                {note.file_paths?.length > 0 && (
                                    <div className='w-full flex justify-center'>
                                        <button className='flex flex-row px-4 h-[30px] items-center mt-[10px] justify-center bg-[#b3b3b6a4] rounded-[12px] gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                            <GoPaperclip size={12} className='text-white' />
                                            <p className='text-white font-[Inter] text-[14px] font-semibold'>
                                                {note.file_paths.length} Attachment(s)
                                            </p>
                                        </button>
                                    </div>
                                )}

                                <div className='flex flex-row mt-[12px] items-center gap-[8px] flex-wrap'>
                                    {note.tags && note.tags.map((tag, index) => (
                                        <p key={index} className='flex h-[28px] w-auto bg-[#E8FFDF] items-center px-[8px] rounded-[12px] text-[#124C09]/70 text-[13px]'>
                                            #{tag}
                                        </p>
                                    ))}
                                </div>

                                <div className='mt-[20px] w-full border-t border-gray-100'></div>

                                <div className='flex flex-row justify-between mt-[12px]'>
                                    <div className='gap-[6px] flex flex-row items-center'>
                                        <button
                                            onClick={(e) => handleLike(note._id || note.id, e)}
                                            className='cursor-pointer flex flex-row items-center gap-[6px] hover:text-red-500 transition-colors'
                                        >
                                            {note.is_liked ? (
                                                <IoHeart size={14} className='text-red-500' />
                                            ) : (
                                                <IoHeartOutline size={14} className='text-[#292D32]' />
                                            )}
                                            <p className={`font-[Inter] text-[14px] font-semibold select-none ${note.is_liked ? 'text-red-500' : 'text-[#124C09]'}`}>
                                                {note.like_count || 0}
                                            </p>
                                        </button>
                                        <button className='cursor-pointer flex flex-row items-center gap-[6px] hover:text-blue-500 transition-colors'>
                                            <PiChatText size={14} className='text-[#292D32]' />
                                            <p className='font-[Inter] text-[14px] font-semibold text-[#124C09] select-none'>
                                                {note.comments_count || 0}
                                            </p>
                                        </button>
                                        <div className='flex flex-row items-center gap-[6px] text-gray-400'>
                                            <LuEye size={14} className='text-[#292D32]' />
                                            <p className='font-[Inter] text-[14px] font-semibold text-[#124C09] select-none'>
                                                {formatViews(note.views || 0)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex flex-row items-center gap-[16px]'>
                                        <button className='cursor-pointer hover:text-green-600 transition-colors'>
                                            <MdOutlineFileDownload size={14} className='text-[#292D32]' />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleBookmark(note); }}
                                            className={`cursor-pointer transition-colors ${isBookmarked(note._id || note.id) ? 'text-yellow-400' : 'text-[#292D32] hover:text-yellow-500'}`}
                                        >
                                            {isBookmarked(note._id || note.id) ? (
                                                <BsBookmarkDashFill size={14} />
                                            ) : (
                                                <BsBookmarkDash size={14} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && results.length > 0 && (
                <div className="w-full flex justify-center py-8">
                    <p className="text-gray-500 font-['Inter'] animate-pulse">Loading more...</p>
                </div>
            )}
            {!hasMore && results.length > 0 && (
                <div className="w-full flex justify-center py-8">
                    <p className="text-gray-400 font-['Inter'] text-sm">You've reached the end of the results!</p>
                </div>
            )}
        </div>
    )
}

export default Search_page
