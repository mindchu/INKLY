import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { GiPlainCircle } from "react-icons/gi";
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { GoComment } from "react-icons/go";
import { LuEye, LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import { MdOutlineFileDownload } from "react-icons/md";
import { useBookmarks } from '../../context/BookmarksContext';
import { useSortContext } from '../../context/SortContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';

const Note_forum_page = () => {
    const navigate = useNavigate();
    const { sortBy } = useSortContext();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleBookmark = (post, e) => {
        e.stopPropagation();
        toggleBookmark(post);
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', 'post');
            params.append('sort', sortBy === 'hot' ? 'views' : (sortBy === 'top' ? 'likes' : 'recent'));
            const response = await api.get(`/content/recommended?${params.toString()}`);
            setPosts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch forum posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [sortBy]);

    const handleLike = async (postId, e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/content/${postId}/like`);
            if (response.success) {
                setPosts(prev => prev.map(post => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            is_liked: response.is_liked,
                            likes_count: response.is_liked ? (post.likes_count || 0) + 1 : (post.likes_count || 1) - 1
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    if (loading) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <p className='font-[Inter] text-xl animate-pulse text-gray-600'>Fetching notes...</p>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto py-6'>
            {posts.length === 0 ? (
                <div className='w-full h-full flex items-center justify-center'>
                    <p className='font-[Inter] text-lg text-gray-500'>No notes found in the forum.</p>
                </div>
            ) : (
                posts.map((post) => (
                    <div
                        key={post._id}
                        className='flex flex-col w-full min-h-[150px] max-w-[calc(100%-80px)] mx-[40px] mb-[24px] bg-white rounded-[12px] shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer'
                        onClick={() => navigate(`/content/${post._id}`)}
                    >
                        <div className='flex justify-between flex-row w-full'>
                            <div className='flex flex-row items-center gap-[12px]'>
                                {post.author_profile_picture_url ? (
                                    <img
                                        src={post.author_profile_picture_url.startsWith('http') ? post.author_profile_picture_url : `${import.meta.env.VITE_API_URL || 'http://localhost:6001/api'}${post.author_profile_picture_url.replace('/api', '')}`}
                                        alt={post.author_username}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className='w-8 h-8 rounded-full bg-[#577F4E] flex items-center justify-center text-white text-xs font-bold'>
                                        {post.author_username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <p className='font-["Inter"] text-[14px] font-semibold text-[#124C09] flex items-center gap-2'>
                                        {post.author_username}
                                        <FollowChip authorId={post.author_id} initialIsFollowing={post.is_following} />
                                    </p>
                                    <p className='font-["Inter"] text-[9px] text-gray-400'>{new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {post.file_paths?.length > 0 && (
                                <button className='h-[30px] px-4 bg-[#B3B3B6]/60 text-white items-center flex justify-center rounded-[12px] gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                    <GoPaperclip size={14} className='text-white' />
                                    <p className='text-sm'>{post.file_paths.length} Attachment(s)</p>
                                </button>
                            )}
                        </div>
                        <div className='mt-[12px] flex gap-4'>
                            <div className="flex-1">
                                <p className='font-["Inter"] text-[18px] font-semibold text-[#124C09]'>{post.title}</p>
                                <p className='font-["Inter"] text-[13px] text-gray-600 mt-2 line-clamp-2'>{post.text}</p>
                            </div>
                            {post.file_paths?.some(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase())) && (
                                <div className="w-[100px] h-[70px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:6001/api'}/uploads/${post.file_paths.find(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase()))}`}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <div className='flex flex-row flex-wrap items-center gap-[8px] mt-4'>
                            {post.tags?.map((tag, idx) => (
                                <p key={idx} className='bg-[#E8FFDF] px-[10px] py-1 rounded-[12px] text-[#124C09]/70 font-["Inter"] text-[12px]'>
                                    #{tag}
                                </p>
                            ))}
                        </div>
                        <div className='flex flex-row justify-between items-center mt-4 border-t border-gray-100 pt-3'>
                            <div></div>
                            <div className='flex flex-row gap-[18px] items-center'>
                                <button
                                    onClick={(e) => handleLike(post._id, e)}
                                    className='cursor-pointer gap-[6px] items-center flex flex-row'
                                >
                                    {post.is_liked ? (
                                        <IoHeart size={14} className='text-red-500' />
                                    ) : (
                                        <IoHeartOutline size={14} className='text-[#292D32]' />
                                    )}
                                    <p className={`font-["Inter"] text-[12px] ${post.is_liked ? 'text-red-500' : 'text-gray-500'}`}>
                                        {post.likes_count || 0}
                                    </p>
                                </button>
                                <button className='cursor-pointer gap-[6px] items-center flex flex-row group'>
                                    <GoComment size={14} className='text-[#292D32] group-hover:text-blue-500' />
                                    <p className='font-["Inter"] text-[12px] text-gray-500 group-hover:text-blue-500'>
                                        {post.comments_count || 0}
                                    </p>
                                </button>
                                <div className='gap-[6px] items-center flex flex-row'>
                                    <LuEye size={14} className='text-[#292D32]' />
                                    <p className='font-["Inter"] text-[12px] text-gray-500'>{post.views || 0}</p>
                                </div>
                                <button
                                    className='hover:text-yellow-500 transition-colors'
                                    onClick={(e) => handleBookmark(post, e)}
                                >
                                    {isBookmarked(post._id || post.id) ? (
                                        <BsBookmarkDashFill size={16} className='text-yellow-400' />
                                    ) : (
                                        <LuBookmarkMinus size={16} className='text-[#292D32]' />
                                    )}
                                </button>
                                <button className='hover:text-green-600'>
                                    <MdOutlineFileDownload size={16} className='text-[#292D32]' />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default Note_forum_page
