import React, { useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye, LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';
import { useSearch } from '../../context/SearchContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';
import { getMediaUrl } from '../../config';
import { TagsChipView } from '../common/TagsChip';
import ShareButton from '../button/ShareButton';


const Search_page = () => {
    const { results, loading, setResults, setPage, hasMore } = useSearch();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const navigate = useNavigate();
    const location = useLocation();

    const observer = useRef();
    const lastNoteElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && Array.isArray(results) && results.length > 0 && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, results, setPage]);

    const formatViews = (views) => {
        if (views >= 1000) return (views / 1000).toFixed(1) + 'k';
        return views ? views.toString() : '0';
    };

    const handleLike = async (noteId, e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/content/${noteId}/like`);
            if (response.success) {
                setResults(prev => prev.map(note => {
                    if ((note._id || note.id) === noteId) {
                        return {
                            ...note,
                            is_liked: response.is_liked,
                            like_count: response.is_liked ? (note.like_count || 0) + 1 : Math.max(0, (note.like_count || 1) - 1)
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

    const handleFollowChange = (authorId, isNowFollowing) => {
        setResults(prevResults =>
            prevResults.map(note =>
                note.author_id === authorId
                    ? { ...note, is_following: isNowFollowing }
                    : note
            )
        );
    };

    const handleCardClick = (note) => {
        navigate(`/content/${note._id || note.id}`, { state: { from: location.pathname } });
    };

    if (loading && results.length === 0) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <p className='font-[Inter] text-xl animate-pulse'>Searching...</p>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto relative pb-[76px] md:pb-0'>

            {/* Mobile: forum-style list  |  Desktop: original grid */}
            <div className='flex flex-col gap-3 px-3 py-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:p-8'>
                {results.map((note, index) => {
                    const noteId = note._id || note.id;
                    const isTriggerNote = index === Math.max(0, results.length - 5);
                    const thumbFile = note.file_paths?.find(f =>
                        ['png', 'jpg', 'jpeg', 'webp'].includes(f.split('.').pop().toLowerCase())
                    );

                    return (
                        <div
                            ref={isTriggerNote ? lastNoteElementRef : null}
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

            {loading && results.length > 0 && (
                <div className="w-full flex justify-center pb-8">
                    <p className="text-gray-500 font-['Inter'] animate-pulse">Loading more...</p>
                </div>
            )}
            {!hasMore && results.length > 0 && (
                <div className="w-full flex justify-center pb-8">
                    <p className="text-gray-400 font-['Inter'] text-sm">You've reached the end!</p>
                </div>
            )}
        </div>
    );
}

export default Search_page
