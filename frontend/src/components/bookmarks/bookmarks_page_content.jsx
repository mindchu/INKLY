import React, { useMemo } from 'react'
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
import { BsBookmarkDashFill } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';
import { getMediaUrl } from '../../config';


const Bookmarks_page_content = ({ sortBy }) => {
    const { bookmarkedNotes, toggleBookmark, loading, setBookmarkedNotes } = useBookmarks();

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
                setBookmarkedNotes(prev => prev.map(note => {
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

    const sortedNotes = useMemo(() => {
        let sorted = [...bookmarkedNotes];

        switch (sortBy) {
            case 'date_created':
                sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'most_recent':
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'title_az':
                sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'title_za':
                sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                break;
            default:
                break;
        }

        return sorted;
    }, [bookmarkedNotes, sortBy]);

    if (loading) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <p className='font-[Inter] text-xl animate-pulse text-gray-600'>Loading your bookmarks...</p>
            </div>
        );
    }

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
                    <div key={note._id || note.id} className='bg-white rounded-xl p-6 shadow-sm flex flex-col relative hover:shadow-md transition-shadow cursor-pointer'>
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleBookmark(note); }}
                            className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition z-20'
                        >
                            <BsBookmarkDashFill size={20} className='text-yellow-400' />
                        </button>

                        <h3 className='text-lg font-semibold text-gray-800 mb-3 pr-8'>{note.title}</h3>

                        <div className='flex items-center gap-2 mb-3'>
                            {note.author_profile_picture_url ? (
                                <img
                                    src={getMediaUrl(note.author_profile_picture_url)}
                                    alt={note.author_username}
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold'>
                                    {note.author_username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <span className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                {note.author_username}
                                <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                            </span>
                        </div>

                        <div className="flex gap-3 mb-4 flex-grow">
                            <p className='text-sm text-gray-600 line-clamp-3 flex-1'>
                                {note.text}
                            </p>
                            {note.file_paths?.some(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase())) && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
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

                        <div className='flex flex-wrap gap-2 mb-4'>
                            {note.tags && note.tags.map((tag, tagIndex) => (
                                <span
                                    key={tagIndex}
                                    className='text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium'
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <div className='border-t border-gray-200 mb-4'></div>

                        <div className='flex items-center justify-between text-sm text-gray-600'>
                            <div className='flex items-center gap-4'>
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
                                    <span>{formatViews(note.views || 0)}</span>
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

export default Bookmarks_page_content
