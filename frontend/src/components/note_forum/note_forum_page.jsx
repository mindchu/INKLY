import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { GoComment } from "react-icons/go";
import { LuEye, LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';
import { useSortContext } from '../../context/SortContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';
import { getMediaUrl } from '../../config';
import ShareButton from '../button/ShareButton';

const Note_forum_page = () => {
    const navigate = useNavigate();
    const { sortBy, content, loading, setContent, page, setPage, hasMore } = useSortContext();
    const { toggleBookmark, isBookmarked } = useBookmarks();

    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && Array.isArray(content) && content.length > 0 && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const posts = React.useMemo(() => content.filter(item => item.type === 'post'), [content]);

    const handleLike = async (postId, e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/content/${postId}/like`);
            if (response.success) {
                setContent(prev => prev.map(post => {
                    if ((post._id || post.id) === postId) {
                        return {
                            ...post,
                            is_liked: response.is_liked,
                            like_count: response.is_liked ? (post.like_count || 0) + 1 : (post.like_count || 1) - 1
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleBookmark = (post, e) => {
        e.stopPropagation();
        toggleBookmark(post);
    };

    if (loading && posts.length === 0) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading notes...</div>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className='flex flex-col gap-4 sm:gap-5 md:gap-6 px-3 sm:px-6 md:px-10 lg:px-[40px] py-6 sm:py-8 md:py-[50px]'>
                {posts.length > 0 ? (
                    <>
                        {posts.map((post, index) => {
                            const isTriggerPost = index === Math.max(0, posts.length - 3);
                            return (
                                <div
                                    ref={isTriggerPost ? lastPostElementRef : null}
                                    key={post._id || post.id}
                                    className='flex flex-col w-full min-h-[130px] sm:min-h-[150px] bg-white rounded-[12px] p-3 sm:p-4 md:p-[12px] shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                                    onClick={() => navigate(`/content/${post._id || post.id}`)}
                                >
                                    {/* Author row */}
                                    <div className='flex justify-between flex-row w-full gap-2'>
                                        <div className='flex flex-row justify-center gap-2 sm:gap-3 items-center min-w-0'>
                                            {post.author_profile_picture_url ? (
                                                <img
                                                    src={getMediaUrl(post.author_profile_picture_url)}
                                                    alt={post.author_username}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#577F4E] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0'>
                                                    {post.author_username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div className='min-w-0'>
                                                <p className='font-["Inter"] text-[13px] sm:text-[14px] font-semibold text-[#124C09]/70 flex items-center gap-1.5 sm:gap-2 flex-wrap'>
                                                    <span className='truncate max-w-[100px] sm:max-w-none'>{post.author_username || 'Unknown'}</span>
                                                    <FollowChip authorId={post.author_id} initialIsFollowing={post.is_following} />
                                                </p>
                                                <p className='font-["Inter"] text-[9px] font-regular text-[#124C09]/70'>{new Date(post.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Attachments badge */}
                                        {post.file_paths?.length > 0 && (
                                            <div className='flex-shrink-0'>
                                                <button className='px-2.5 sm:px-4 h-[28px] sm:h-[30px] bg-[#B3B3B6]/60 text-white items-center flex justify-center rounded-[12px] gap-1.5 sm:gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                                    <GoPaperclip size={13} className='text-white' />
                                                    <p className='text-[10px] sm:text-xs whitespace-nowrap'>{post.file_paths.length} Attachment{post.file_paths.length !== 1 ? 's' : ''}</p>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content row */}
                                    <div className='mt-3 sm:mt-4 flex gap-3 sm:gap-4'>
                                        <div className="flex-1 min-w-0">
                                            <p className='font-["Inter"] text-[15px] sm:text-[17px] md:text-[18px] font-semibold text-gray-800 break-words'>{post.title}</p>
                                            <p className='font-["Inter"] text-[12px] sm:text-[13px] font-regular text-gray-600 mt-2 sm:mt-3 break-words whitespace-pre-wrap line-clamp-2 sm:line-clamp-3'>{post.text}</p>
                                        </div>
                                        {post.file_paths?.some(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase())) && (
                                            <div className="w-[70px] h-[60px] sm:w-[90px] sm:h-[72px] md:w-[100px] md:h-[80px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                                <img
                                                    src={getMediaUrl(`/uploads/${post.file_paths.find(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase()))}`)}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {post.tags?.length > 0 && (
                                        <div className='flex flex-row items-center gap-1.5 sm:gap-2 flex-wrap mt-3 sm:mt-4'>
                                            {post.tags.map((tag, index) => (
                                                <p key={index} className='flex w-auto bg-[#E8FFDF] items-center px-2.5 sm:px-[10px] py-0.5 sm:py-1 rounded-[12px] text-[#124C09]/70 font-["Inter"] text-[10px] sm:text-[12px] font-regular'>
                                                    #{tag}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions row */}
                                    <div className='flex flex-row justify-end mt-3 sm:mt-4 border-t border-gray-100 pt-2.5 sm:pt-3'>
                                        <div className='flex flex-row gap-3 sm:gap-4 md:gap-[18px] mr-0 sm:mr-4 md:mr-[32px]'>
                                            <button
                                                onClick={(e) => handleLike(post._id || post.id, e)}
                                                className='cursor-pointer gap-1 sm:gap-1.5 items-center flex flex-row hover:text-red-500 transition-colors'
                                            >
                                                {post.is_liked ? (
                                                    <IoHeart size={14} className='text-red-500' />
                                                ) : (
                                                    <IoHeartOutline size={14} className='text-[#292D32]' />
                                                )}
                                                <p className={`font-["Inter"] text-[11px] sm:text-[12px] font-regular select-none ${post.is_liked ? 'text-red-500' : ''}`}>
                                                    {post.like_count || 0}
                                                </p>
                                            </button>
                                            <button className='cursor-pointer gap-1 sm:gap-1.5 items-center flex flex-row hover:text-blue-500 transition-colors'>
                                                <GoComment size={14} className='text-[#292D32]' />
                                                <p className='font-["Inter"] text-[11px] sm:text-[12px] font-regular select-none'>{post.comments_count || 0}</p>
                                            </button>
                                            <div className='gap-1 sm:gap-1.5 items-center flex flex-row text-gray-400'>
                                                <LuEye size={14} className='text-[#292D32]' />
                                                <p className='font-["Inter"] text-[11px] sm:text-[12px] font-regular select-none'>{post.views || 0}</p>
                                            </div>
                                            <button
                                                className='cursor-pointer flex flex-row hover:text-yellow-500 transition-colors'
                                                onClick={(e) => handleBookmark(post, e)}
                                            >
                                                {isBookmarked(post._id || post.id) ? (
                                                    <BsBookmarkDashFill size={14} className='text-yellow-400' />
                                                ) : (
                                                    <LuBookmarkMinus size={14} className='text-[#292D32]' />
                                                )}
                                            </button>
                                            <ShareButton
                                                targetId={post._id || post.id}
                                                title={post.title}
                                                text={post.text?.substring(0, 100) || 'Check out this note'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {loading && posts.length > 0 && (
                            <div className="w-full flex justify-center py-4">
                                <p className="text-gray-500 font-['Inter'] animate-pulse">Loading more...</p>
                            </div>
                        )}
                        {!hasMore && posts.length > 0 && (
                            <div className="w-full flex justify-center py-4">
                                <p className="text-gray-400 font-['Inter'] text-sm">You've reached the end!</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className='w-full text-center py-20 text-gray-500'>
                        No notes found. Upload one!
                    </div>
                )}
            </div>
        </div>
    );
}

export default Note_forum_page