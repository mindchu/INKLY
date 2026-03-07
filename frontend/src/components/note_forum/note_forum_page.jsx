import React, { useRef, useCallback } from 'react'
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
  const { content, loading, setContent, setPage, hasMore } = useSortContext();
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

  const handleFollowChange = (authorId, isNowFollowing) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.author_id === authorId
          ? { ...note, is_following: isNowFollowing }
          : note
      )
    );
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
      <div className='flex flex-col gap-4 px-3 md:px-6 lg:px-10 py-5 md:py-8'>

        {posts.length > 0 ? (
          <>
            {posts.map((post, index) => {
              const postId = post._id || post.id;
              const isTriggerPost = index === Math.max(0, posts.length - 3);
              const thumbFile = post.file_paths?.find(f =>
                ['png', 'jpg', 'jpeg', 'webp'].includes(f.split('.').pop().toLowerCase())
              );

              return (
                <div
                  ref={isTriggerPost ? lastPostElementRef : null}
                  key={postId}
                  className='w-full bg-white rounded-[12px] p-3 md:p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                  onClick={() => navigate(`/content/${postId}`)}
                >
                  {/* ── Author row ──────────────────────────────── */}
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 min-w-0'>
                      {post.author_profile_picture_url ? (
                        <img
                          src={getMediaUrl(post.author_profile_picture_url)}
                          alt={post.author_username}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-[#577F4E] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0'>
                          {post.author_username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <p className='font-["Inter"] text-[13px] md:text-[14px] font-semibold text-[#124C09]/70 flex items-center gap-1.5 flex-wrap leading-tight'>
                          <span className='truncate'>{post.author_username || 'Unknown'}</span>
                          <FollowChip
                            authorId={post.author_id}
                            initialIsFollowing={post.is_following}
                            onFollowChange={handleFollowChange}
                          />
                        </p>
                        <p className='font-["Inter"] text-[10px] text-[#124C09]/50 mt-0.5'>
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Content ─────────────────────────────────── */}
                  <div className='mt-3 flex gap-3'>
                    <div className='flex-1 min-w-0'>
                      <p className='font-["Inter"] text-[15px] md:text-[17px] font-semibold text-gray-800 break-all leading-snug'>
                        {post.title}
                      </p>
                      {post.text && (
                        <p className='font-["Inter"] text-[12px] md:text-[13px] text-gray-500 mt-1.5 line-clamp-2 md:line-clamp-3 break-all'>
                          {post.text}
                        </p>
                      )}
                    </div>
                    {thumbFile && (
                      <div className='w-[72px] h-[60px] md:w-[90px] md:h-[72px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100'>
                        <img
                          src={getMediaUrl(`/uploads/${thumbFile}`)}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Tags ────────────────────────────────────── */}
                  {post.tags?.length > 0 && (
                    <div className='flex flex-row flex-wrap gap-1.5 mt-2.5'>
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className='bg-[#E8FFDF] text-[#124C09]/70 font-["Inter"] text-[11px] md:text-[12px] px-2.5 py-0.5 rounded-full'
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── Actions ─────────────────────────────────── */}
                  <div className='flex justify-end mt-3 pt-2.5 border-t border-gray-100'>
                    <div className='flex items-center gap-3 md:gap-4'>
                      {/* Like */}
                      <button
                        onClick={(e) => handleLike(postId, e)}
                        className='flex items-center gap-1 hover:text-red-500 transition-colors'
                      >
                        {post.is_liked
                          ? <IoHeart size={14} className='text-red-500' />
                          : <IoHeartOutline size={14} className='text-[#292D32]' />
                        }
                        <span className={`font-["Inter"] text-[12px] select-none ${post.is_liked ? 'text-red-500' : 'text-gray-600'}`}>
                          {post.like_count || 0}
                        </span>
                      </button>

                      {/* Comments */}
                      <button className='flex items-center gap-1 hover:text-blue-500 transition-colors'>
                        <GoComment size={14} className='text-[#292D32]' />
                        <span className='font-["Inter"] text-[12px] text-gray-600 select-none'>{post.comments_count || 0}</span>
                      </button>

                      {/* Views */}
                      <div className='flex items-center gap-1'>
                        <LuEye size={14} className='text-[#292D32]' />
                        <span className='font-["Inter"] text-[12px] text-gray-600 select-none'>{post.views || 0}</span>
                      </div>

                      {/* Bookmark */}
                      <button
                        onClick={(e) => handleBookmark(post, e)}
                        className='flex items-center hover:text-yellow-500 transition-colors'
                      >
                        {isBookmarked(postId)
                          ? <BsBookmarkDashFill size={14} className='text-yellow-400' />
                          : <LuBookmarkMinus size={14} className='text-[#292D32]' />
                        }
                      </button>

                      {/* Share */}
                      <ShareButton
                        targetId={postId}
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
          <div className='w-full text-center py-20 text-gray-500 font-["Inter"]'>
            No notes found. Upload one!
          </div>
        )}
      </div>
    </div>
  );
}

export default Note_forum_page