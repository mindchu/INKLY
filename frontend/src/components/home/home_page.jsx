import React, { useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye, LuBookmarkMinus } from "react-icons/lu";
import { BsBookmarkDashFill } from "react-icons/bs";
import { useBookmarks } from '../../context/BookmarksContext';
import { useSortContext } from '../../context/SortContext';
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';
import { getMediaUrl } from '../../config';
import ShareButton from '../button/ShareButton';


const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'k';
    return views.toString();
};

// Skeleton card for loading state
const SkeletonCard = () => (
    <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 animate-pulse'>
        <div className='flex justify-between items-start'>
            <div className='h-4 bg-gray-200 rounded-full w-2/3' />
            <div className='h-5 bg-gray-100 rounded-full w-16' />
        </div>
        <div className='flex items-center gap-2'>
            <div className='w-6 h-6 bg-gray-200 rounded-full' />
            <div className='h-3 bg-gray-200 rounded-full w-24' />
        </div>
        <div className='space-y-1.5'>
            <div className='h-3 bg-gray-100 rounded-full w-full' />
            <div className='h-3 bg-gray-100 rounded-full w-4/5' />
        </div>
        <div className='flex gap-1.5 mt-1'>
            <div className='h-5 bg-green-50 rounded-full w-14' />
            <div className='h-5 bg-green-50 rounded-full w-12' />
        </div>
    </div>
);


const Home_page = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const { content: notes, loading, setContent: setNotes, setPage, hasMore } = useSortContext();

    const observer = useRef();
    const lastNoteElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && Array.isArray(notes) && notes.length > 0 && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

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
                            like_count: response.is_liked
                                ? (note.like_count || 0) + 1
                                : Math.max((note.like_count || 1) - 1, 0),
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

    // Initial loading — show skeletons
    if (loading && notes.length === 0) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] overflow-auto pb-[76px] md:pb-0'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 p-3 md:p-6'>
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto relative pb-[76px] md:pb-0'>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 p-3 md:p-6'>
                {notes.map((note, index) => {
                    const isTriggerNote = index === Math.max(0, notes.length - 3);
                    const noteId = note._id || note.id;
                    const hasImage = note.file_paths?.some(f =>
                        ['png', 'jpg', 'jpeg', 'webp'].includes(f.split('.').pop().toLowerCase())
                    );
                    const thumbFile = hasImage && note.file_paths.find(f =>
                        ['png', 'jpg', 'jpeg', 'webp'].includes(f.split('.').pop().toLowerCase())
                    );

                    return (
                        <div
                            ref={isTriggerNote ? lastNoteElementRef : null}
                            key={noteId}
                            onClick={() => handleCardClick(note)}
                            className='bg-white rounded-2xl shadow-sm flex flex-col cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200 overflow-hidden border border-gray-50'
                        >
                            {/* Thumbnail image — full width at top if exists */}
                            {thumbFile && (
                                <div className="w-full h-36 md:h-44 overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                        src={getMediaUrl(`/uploads/${thumbFile}`)}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className='p-4 flex flex-col flex-grow'>

                                {/* Title + type badge */}
                                <div className="flex justify-between items-start gap-2 mb-2.5">
                                    <h3 className='text-[15px] md:text-base font-semibold text-gray-900 flex-1 line-clamp-2 leading-snug'>
                                        {note.title}
                                    </h3>
                                    {note.type && (
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 mt-0.5 ${
                                            note.type === 'post'
                                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                : 'bg-purple-50 text-purple-600 border border-purple-100'
                                        }`}>
                                            {note.type === 'post' ? 'Note' : 'Disc.'}
                                        </span>
                                    )}
                                </div>

                                {/* Author */}
                                <div className='flex items-center gap-2 mb-2.5'>
                                    {note.author_profile_picture_url ? (
                                        <img
                                            src={getMediaUrl(note.author_profile_picture_url)}
                                            alt={note.author_username}
                                            className="w-5 h-5 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200"
                                        />
                                    ) : (
                                        <div className='w-5 h-5 bg-[#3E4A34] rounded-full flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0'>
                                            {note.author_username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className='text-[12px] font-medium text-gray-600 truncate flex items-center gap-1.5'>
                                        {note.author_username || 'Unknown'}
                                        <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                    </span>
                                </div>

                                {/* Body text */}
                                <p className='text-[13px] text-gray-500 line-clamp-2 leading-relaxed mb-3 flex-grow'>
                                    {note.text}
                                </p>

                                {/* Attachment badge */}
                                {note.file_paths?.length > 0 && !thumbFile && (
                                    <div className='mb-3'>
                                        <span className='text-[11px] text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full'>
                                            📎 {note.file_paths.length} file{note.file_paths.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}

                                {/* Tags */}
                                {note.tags?.length > 0 && (
                                    <div className='flex flex-wrap gap-1 mb-3'>
                                        {note.tags.slice(0, 3).map((tag, tagIndex) => (
                                            <span
                                                key={tagIndex}
                                                className='text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium'
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {note.tags.length > 3 && (
                                            <span className='text-[11px] text-gray-400 px-2 py-0.5'>
                                                +{note.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Divider + actions */}
                                <div className='border-t border-gray-100 pt-2.5 mt-auto'>
                                    <div className='flex items-center justify-between'>
                                        {/* Stats */}
                                        <div className='flex items-center gap-3 text-gray-400'>
                                            <button
                                                onClick={(e) => handleLike(noteId, e)}
                                                className={`flex items-center gap-1 transition-colors ${
                                                    note.is_liked ? 'text-red-500' : 'hover:text-red-400'
                                                }`}
                                            >
                                                {note.is_liked
                                                    ? <IoHeart size={15} />
                                                    : <IoHeartOutline size={15} />
                                                }
                                                <span className='text-[12px] font-medium'>{note.like_count || 0}</span>
                                            </button>

                                            <div className='flex items-center gap-1'>
                                                <PiChatText size={15} />
                                                <span className='text-[12px] font-medium'>{note.comments_count || 0}</span>
                                            </div>

                                            <div className='flex items-center gap-1'>
                                                <LuEye size={15} />
                                                <span className='text-[12px] font-medium'>{formatViews(note.views)}</span>
                                            </div>
                                        </div>

                                        {/* Bookmark + share */}
                                        <div className='flex items-center gap-2 text-gray-400'>
                                            <ShareButton
                                                targetId={noteId}
                                                title={note.title}
                                                text={note.text?.substring(0, 100) || ''}
                                            />
                                            <button
                                                onClick={(e) => handleBookmark(note, e)}
                                                className='hover:text-yellow-500 transition-colors'
                                            >
                                                {isBookmarked(noteId)
                                                    ? <BsBookmarkDashFill size={15} className='text-yellow-400' />
                                                    : <LuBookmarkMinus size={15} />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Load more indicator */}
            {loading && notes.length > 0 && (
                <div className="w-full flex justify-center py-6">
                    <div className='flex items-center gap-2 text-gray-400 text-sm'>
                        <div className='w-4 h-4 border-2 border-gray-300 border-t-[#3E4A34] rounded-full animate-spin' />
                        Loading more...
                    </div>
                </div>
            )}
            {!hasMore && notes.length > 0 && (
                <div className="w-full flex justify-center py-6">
                    <p className="text-gray-400 text-[13px]">You've reached the end!</p>
                </div>
            )}
        </div>
    );
}

export default Home_page