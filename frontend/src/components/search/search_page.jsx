import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
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
import { getMediaUrl } from '../../config';
import { Tags } from 'lucide-react';
import { TagsChipView } from '../common/TagsChip';


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
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto p-4 sm:p-6 lg:p-8'>
            {results.length === 0 && !loading && (
                <div className='w-full flex justify-center py-20'>
                    <p className='font-[Inter] text-xl text-gray-500'>No results found.</p>
                </div>
            )}

            {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
                {results.map((note, index) => {
                    const isTriggerResult = index === Math.max(0, results.length - 3);
                    return (
                        <div
                            ref={isTriggerResult ? lastResultElementRef : null}
                            key={note._id || note.id}
                            className='flex w-full h-auto rounded-[16px] bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                            onClick={() => handleCardClick(note)}
                        >
                            <div className='w-full min-w-0'>
                                {/* Title */}
                                <p className='font-[Inter] text-[17px] sm:text-[20px] text-[#124C09] font-semibold leading-snug line-clamp-2'>
                                    {note.title}
                                </p>

                                {/* Author row */}
                                <div className='mt-3 flex flex-row items-center gap-2 min-w-0'>
                                    {note.author_profile_picture_url ? (
                                        <img
                                            src={getMediaUrl(note.author_profile_picture_url)}
                                            alt={note.author_username}
                                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className='w-6 h-6 rounded-full bg-[#577F4E] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0'>
                                            {note.author_username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <p className='font-[Inter] text-[15px] sm:text-[17px] text-[#124C09] font-semibold flex items-center gap-2 min-w-0 truncate'>
                                        <span className='truncate'>{note.author_username || 'Unknown'}</span>
                                        <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                    </p>
                                </div>

                                {/* Body text */}
                                <p className='mt-3 font-[Inter] text-[13px] sm:text-[14px] text-[#124C09] font-medium line-clamp-3 leading-relaxed'>
                                    {note.text}
                                </p>

                                {/* Attachments */}
                                {note.file_paths?.length > 0 && (
                                    <div className='w-full flex justify-center mt-2'>
                                        <button className='flex flex-row px-4 h-[30px] items-center justify-center bg-[#b3b3b6a4] rounded-[12px] gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                            <GoPaperclip size={12} className='text-white' />
                                            <p className='text-white font-[Inter] text-[13px] font-semibold'>
                                                {note.file_paths.length} Attachment(s)
                                            </p>
                                        </button>
                                    </div>
                                )}

                                {/* Tags */}
                                <TagsChipView tags={note.tags} />


                                <div className='mt-4 w-full border-t border-gray-100'></div>

                                {/* Actions row */}
                                <div className='flex flex-row justify-between mt-3'>
                                    {/* Left: stats */}
                                    <div className='gap-3 sm:gap-[6px] flex flex-row items-center'>
                                        <button
                                            onClick={(e) => handleLike(note._id || note.id, e)}
                                            className='cursor-pointer flex flex-row items-center gap-[5px] hover:text-red-500 transition-colors'
                                        >
                                            {note.is_liked ? (
                                                <IoHeart size={15} className='text-red-500' />
                                            ) : (
                                                <IoHeartOutline size={15} className='text-[#292D32]' />
                                            )}
                                            <p className={`font-[Inter] text-[13px] font-semibold select-none ${note.is_liked ? 'text-red-500' : 'text-[#124C09]'}`}>
                                                {note.like_count || 0}
                                            </p>
                                        </button>
                                        <button className='cursor-pointer flex flex-row items-center gap-[5px] hover:text-blue-500 transition-colors ml-2'>
                                            <PiChatText size={15} className='text-[#292D32]' />
                                            <p className='font-[Inter] text-[13px] font-semibold text-[#124C09] select-none'>
                                                {note.comments_count || 0}
                                            </p>
                                        </button>
                                        <div className='flex flex-row items-center gap-[5px] text-gray-400 ml-2'>
                                            <LuEye size={15} className='text-[#292D32]' />
                                            <p className='font-[Inter] text-[13px] font-semibold text-[#124C09] select-none'>
                                                {formatViews(note.views || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: actions */}
                                    <div className='flex flex-row items-center gap-3 sm:gap-[16px]'>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className='cursor-pointer hover:text-green-600 transition-colors'
                                        >
                                            <MdOutlineFileDownload size={16} className='text-[#292D32]' />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleBookmark(note); }}
                                            className={`cursor-pointer transition-colors ${isBookmarked(note._id || note.id) ? 'text-yellow-400' : 'text-[#292D32] hover:text-yellow-500'}`}
                                        >
                                            {isBookmarked(note._id || note.id) ? (
                                                <BsBookmarkDashFill size={15} />
                                            ) : (
                                                <BsBookmarkDash size={15} />
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