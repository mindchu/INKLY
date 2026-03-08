import React, { useMemo } from 'react'
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye, LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';
import { getMediaUrl } from '../../config';
import { TagsChipView } from '../common/TagsChip';
import { useLocation, useNavigate } from 'react-router-dom';
import ShareButton from '../button/ShareButton';

const Bookmarks_page_content = () => {
    const {
        bookmarkedNotes,
        toggleBookmark,
        isBookmarked,
        loading,
        setBookmarkedNotes,
        includeTags,
        excludeTags,
        sortBy
    } = useBookmarks();
    const location = useLocation();
    const navigate = useNavigate();

    const formatViews = (views) => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return (views || 0).toString();
    };

    const handleCardClick = (note) => {
        const id = note._id || note.id;
        navigate(`/content/${id}`, { state: { from: location.pathname } });
    };

    const handleFollowChange = (authorId, isNowFollowing) => {
        setBookmarkedNotes(prevNotes =>
            prevNotes.map(note =>
                note.author_id === authorId
                    ? { ...note, is_following: isNowFollowing }
                    : note
            )
        );
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

    const handleBookmark = (note, e) => {
        e.stopPropagation();
        toggleBookmark(note);
    };

    const sortedNotes = bookmarkedNotes;


    if (loading && bookmarkedNotes.length === 0) {
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

    if (sortedNotes.length === 0) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-center'>
                    <BsBookmarkDashFill size={64} className='text-gray-300 mx-auto mb-4' />
                    <h2 className='text-2xl font-semibold text-gray-600 mb-2'>No Results</h2>
                    <p className='text-gray-500'>No bookmarks match your current filters.</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto relative pb-[76px] md:pb-0'>
            <div className='flex flex-col gap-3 px-3 py-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:p-8'>
                {sortedNotes.map((note) => {
                    const noteId = note._id || note.id;
                    const thumbFile = note.file_paths?.find(f =>
                        ['png', 'jpg', 'jpeg', 'webp'].includes(f.split('.').pop().toLowerCase())
                    );

                    return (
                        <div
                            key={noteId}
                            className='bg-white rounded-[12px] shadow-sm p-3 md:p-6 flex flex-col cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]'
                            onClick={() => handleCardClick(note)}
                        >
                            {/* ── Author row ──────────────────────────────── */}
                            <div className='flex items-center justify-between gap-2'>
                                <div className='flex items-center gap-2 min-w-0'>
                                    {note.author_profile_picture_url ? (
                                        <img
                                            src={getMediaUrl(note.author_profile_picture_url)}
                                            alt={note.author_username}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className='w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#577F4E] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0'>
                                            {note.author_username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className='min-w-0'>
                                        <div className='font-["Inter"] text-[13px] md:text-[14px] font-semibold text-[#124C09]/70 flex items-center gap-1.5 flex-wrap leading-tight'>
                                            <span className='truncate'>{note.author_username || 'Unknown'}</span>
                                            <FollowChip
                                                authorId={note.author_id}
                                                initialIsFollowing={note.is_following}
                                                onFollowChange={handleFollowChange}
                                            />
                                            <p className='font-["Inter"] text-[10px] text-[#124C09]/50 mt-0.5 truncate'>
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2 flex-shrink-0'>
                                    {note.type && (
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${note.type === 'post'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                                            }`}>
                                            {note.type === 'post' ? 'Note' : 'Discussion'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ── Content ─────────────────────────────────── */}
                            <div className='mt-3 flex gap-3 flex-grow'>
                                <div className='flex-1 min-w-0'>
                                    <p className='font-["Inter"] text-[15px] md:text-[18px] font-semibold text-gray-800 break-words leading-snug line-clamp-2'>
                                        {note.title}
                                    </p>
                                    {note.text && (
                                        <p className='font-["Inter"] text-[12px] md:text-sm text-gray-500 mt-1.5 break-words line-clamp-2 md:line-clamp-3 whitespace-pre-wrap'>
                                            {note.text}
                                        </p>
                                    )}
                                </div>
                                {thumbFile && (
                                    <div className='w-[64px] h-[56px] md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100'>
                                        <img
                                            src={getMediaUrl(`/uploads/${thumbFile}`)}
                                            alt="Thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* ── Tags ────────────────────────────────────── */}
                            <TagsChipView tags={note.tags} />

                            {/* ── Actions ─────────────────────────────────── */}
                            <div className='flex justify-end mt-3 pt-2.5 border-t border-gray-100'>
                                <div className='flex items-center gap-3 md:gap-4'>
                                    {/* Like */}
                                    <button
                                        onClick={(e) => handleLike(noteId, e)}
                                        className='flex items-center gap-1 hover:text-red-500 transition-colors'
                                    >
                                        {note.is_liked
                                            ? <IoHeart size={16} className='text-red-500' />
                                            : <IoHeartOutline size={16} className='text-[#292D32]' />
                                        }
                                        <span className={`font-["Inter"] text-[12px] select-none ${note.is_liked ? 'text-red-500' : 'text-gray-600'}`}>
                                            {note.like_count || 0}
                                        </span>
                                    </button>

                                    {/* Comments */}
                                    <div className='flex items-center gap-1'>
                                        <PiChatText size={16} className='text-[#292D32]' />
                                        <span className='font-["Inter"] text-[12px] select-none'>
                                            {note.comments_count || 0}
                                        </span>
                                    </div>

                                    {/* Views */}
                                    <div className='flex items-center gap-1'>
                                        <LuEye size={16} className='text-[#292D32]' />
                                        <span className='font-["Inter"] text-[12px] select-none'>
                                            {formatViews(note.views)}
                                        </span>
                                    </div>

                                    {/* Bookmark */}
                                    <button
                                        onClick={(e) => handleBookmark(note, e)}
                                        className='flex items-center justify-center hover:text-yellow-500 transition-colors'
                                        title="Bookmark"
                                    >
                                        {isBookmarked(noteId)
                                            ? <BsBookmarkDashFill size={16} className='text-yellow-400' />
                                            : <LuBookmarkMinus size={16} className='text-[#292D32]' />
                                        }
                                    </button>

                                    {/* Share */}
                                    <div className="flex items-center justify-center">
                                        <ShareButton
                                            targetId={noteId}
                                            title={note.title}
                                            text={note.text?.substring(0, 100) || 'Check out this post'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Bookmarks_page_content
