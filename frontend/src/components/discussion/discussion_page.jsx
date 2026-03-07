import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { GiPlainCircle } from "react-icons/gi";
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { GoComment } from "react-icons/go";
import { LuEye, LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import ShareButton from "../button/ShareButton";
import { useBookmarks } from '../../context/BookmarksContext';
import { api } from '../../util/api';
import { useSortContext } from '../../context/SortContext';
import FollowChip from '../common/FollowChip';
import { getMediaUrl } from '../../config';


const Discussion_page = () => {
    const navigate = useNavigate();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const { sortBy, content, loading, setContent, page, setPage, hasMore } = useSortContext();

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

    // Filter content to only show discussions
    const posts = React.useMemo(() => content.filter(item => item.type === 'discussion'), [content]);

    // Removed local fetchDiscussions logic as it's now handled by SortContext

    const handleLike = async (postId, e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/content/${postId}/like`);
            if (response.success) {
                setPosts(prev => prev.map(post => {
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
                <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading discussions...</div>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className='flex flex-col gap-[24px] px-[40px] py-[50px]'>
                {posts.length > 0 ? (
                    <>
                        {posts.map((post, index) => {
                            // Trigger fetch when 3 items away from the bottom to make scroll smoother
                            const isTriggerPost = index === Math.max(0, posts.length - 3);
                            return (
                                <div
                                    ref={isTriggerPost ? lastPostElementRef : null}
                                    key={post._id || post.id}
                                    className='flex flex-col w-full min-h-[150px] bg-white rounded-[12px] p-[12px] shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                                    onClick={() => navigate(`/content/${post._id || post.id}`)}
                                >
                                    <div className='flex justify-between flex-row w-full'>
                                        <div className='flex flex-row justify-center gap-[12px] items-center'>
                                            {post.author_profile_picture_url ? (
                                                <img
                                                    src={getMediaUrl(post.author_profile_picture_url)}
                                                    alt={post.author_username}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className='w-8 h-8 rounded-full bg-[#577F4E] flex items-center justify-center text-[10px] text-white font-bold'>
                                                    {post.author_username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <p className='font-["Inter"] text-[14px] font-semibold text-[#124C09]/70 flex items-center gap-2'>
                                                    {post.author_username || 'Unknown'}
                                                    <FollowChip authorId={post.author_id} initialIsFollowing={post.is_following} />
                                                </p>
                                                <p className='font-["Inter"] text-[9px] font-regular text-[#124C09]/70'>Posted recently</p>
                                            </div>
                                        </div>
                                        {post.file_paths?.length > 0 && (
                                            <div className='mt-[8px] mr-[20px]'>
                                                <button className='px-4 h-[30px] bg-[#B3B3B6]/60 text-white items-center flex justify-center rounded-[12px] gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                                    <GoPaperclip size={14} className='text-white' />
                                                    <p className='text-xs'>{post.file_paths.length} Attachment(s)</p>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className='mt-[16px] flex gap-4'>
                                        <div className="flex-1 min-w-0">
                                            <p className='font-["Inter"] text-[18px] font-semibold text-gray-800 break-all'>{post.title}</p>
                                            <p className='font-["Inter"] text-[13px] font-regular text-gray-600 mt-[12px] break-all whitespace-pre-wrap line-clamp-3'>{post.text}</p>
                                        </div>
                                        {post.file_paths?.some(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase())) && (
                                            <div className="w-[100px] h-[80px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                                <img
                                                    src={getMediaUrl(`/uploads/${post.file_paths.find(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase()))}`)}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex flex-row items-center gap-[8px] flex-wrap mt-[16px]'>
                                        {post.tags?.map((tag, index) => (
                                            <p key={index} className='flex w-auto bg-[#E8FFDF] items-center px-[10px] py-1 rounded-[12px] text-[#124C09]/70 font-["Inter"] text-[12px] font-regular'>
                                                #{tag}
                                            </p>
                                        ))}
                                    </div>
                                    <div className='flex flex-row justify-between mt-[16px] border-t border-gray-100 pt-3'>
                                        <div></div>

                                        <div className='flex flex-row gap-[18px] mr-[32px]'>
                                            <button
                                                onClick={(e) => handleLike(post._id || post.id, e)}
                                                className='cursor-pointer gap-[6px] items-center flex flex-row hover:text-red-500 transition-colors'
                                            >
                                                {post.is_liked ? (
                                                    <IoHeart size={14} className='text-red-500' />
                                                ) : (
                                                    <IoHeartOutline size={14} className='text-[#292D32]' />
                                                )}
                                                <p className={`font-["Inter"] text-[12px] font-regular select-none ${post.is_liked ? 'text-red-500' : ''}`}>
                                                    {post.like_count || 0}
                                                </p>
                                            </button>
                                            <button className='cursor-pointer gap-[6px] items-center flex flex-row hover:text-blue-500 transition-colors'>
                                                <GoComment size={14} className='text-[#292D32]' />
                                                <p className='font-["Inter"] text-[12px] font-regular select-none'>{post.comments_count || 0}</p>
                                            </button>
                                            <div className='gap-[6px] items-center flex flex-row text-gray-400'>
                                                <LuEye size={14} className='text-[#292D32]' />
                                                <p className='font-["Inter"] text-[12px] font-regular select-none'>{post.views || 0}</p>
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
                                                text={post.text?.substring(0, 100) || 'Check out this discussion'} 
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
                        No discussions found. Start one!
                    </div>
                )}
            </div>
        </div>
    )
}

export default Discussion_page
