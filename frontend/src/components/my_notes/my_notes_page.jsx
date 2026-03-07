import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Eye } from 'lucide-react'
import { FaRegEdit } from "react-icons/fa"
import { BsBookmarkDashFill, BsBookmarkDash } from "react-icons/bs"

import LikeButton from '../../components/button/LikeButton';
import DeleteButton from '../../components/button/DeleteButton';
import ShareButton from '../../components/button/ShareButton';
import { useMyNotesContext } from '../../context/MyNotesContext'
import { useBookmarks } from '../../context/BookmarksContext'
import FollowChip from '../common/FollowChip'
import { getMediaUrl } from '../../config'
import { TagsChipView } from '../common/TagsChip';


const My_notes_page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, sortBy, documents, discussions, loading } = useMyNotesContext();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const [selectedNote, setSelectedNote] = useState(null);
  const [localNotes, setLocalNotes] = useState([]);

  useEffect(() => {
    setLocalNotes([...documents]);
  }, [documents]);

  const stats = [
    { value: localNotes.length.toString(), label: 'Total items' },
    { value: localNotes.reduce((sum, note) => sum + (note.views || 0), 0).toString(), label: 'Total views' },
    { value: localNotes.reduce((sum, note) => sum + (note.like_count || 0), 0).toString(), label: 'Total likes' }
  ];

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...localNotes];
    let sorted = [...filtered];
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
  }, [localNotes, searchQuery, sortBy]);

  const handleBookmark = (note, e) => {
    e.stopPropagation();
    toggleBookmark(note);
  };

  const handleEdit = (note, e) => {
    e.stopPropagation();
    navigate(`/edit/${note._id || note.id}`);
  };

  const handleCardClick = (note) => {
    navigate(`/content/${note._id || note.id}`, { state: { from: location.pathname } });
  };

  if (loading && localNotes.length === 0) {
    return (
      <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
        <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading your notes...</div>
      </div>
    );
  }

  return (
    <div className='w-full h-full bg-[#EEF2E1] overflow-auto relative'>
      {selectedNote && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10 pointer-events-none" />
      )}

      <div className='px-4 sm:px-8 py-6'>
        {/* Stats row */}
        <div className='grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8'>
          {stats.map((stat, index) => (
            <div key={index} className='bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
              <div className='text-2xl sm:text-4xl font-semibold mb-1 sm:mb-2'>{stat.value}</div>
              <div className='text-gray-600 text-xs sm:text-sm'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Notes grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
          {filteredAndSortedNotes.map((note) => (
            <div
              key={note._id || note.id}
              className='bg-white rounded-xl p-4 sm:p-6 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow'
              onClick={() => handleCardClick(note)}
            >
              {/* Title */}
              <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-3 break-all line-clamp-2'>{note.title}</h3>

              {/* Author */}
              <div className='flex items-center gap-2 mb-3 min-w-0'>
                {note.author_profile_picture_url ? (
                  <img
                    src={getMediaUrl(note.author_profile_picture_url)}
                    alt={note.author_username}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0'>
                    {note.author_username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className='text-sm font-medium text-gray-700 flex items-center gap-2 min-w-0 truncate'>
                  <span className='truncate'>{note.author_username || 'Me'}</span>
                  <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                </span>
              </div>

              {/* Body + thumbnail */}
              <div className="flex gap-3 mb-4">
                <p className='text-sm text-gray-600 line-clamp-3 flex-1 break-all'>
                  {note.text}
                </p>
                {note.file_paths?.some(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase())) && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    <img
                      src={getMediaUrl(`/uploads/${note.file_paths.find(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase()))}`)}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Attachments badge */}
              {note.file_paths?.length > 0 && (
                <div className='mb-4'>
                  <span className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                    📎 {note.file_paths.length} Attachment(s)
                  </span>
                </div>
              )}

              {/* Tags */}
              <TagsChipView tags={note.tags} />

              <div className='border-t border-gray-200 mb-4'></div>

              {/* Actions */}
              <div className='flex items-center justify-between text-sm text-gray-600 gap-2'>
                {/* Stats */}
                <div className='flex items-center gap-3 min-w-0'>
                  <LikeButton
                    targetId={note._id || note.id}
                    initialIsLiked={note.is_liked}
                    initialLikesCount={note.like_count || 0}
                    onLikeSuccess={(id, isLiked) => {
                      setLocalNotes(prev => prev.map(n => {
                        if ((n._id || n.id) === id) {
                          return {
                            ...n,
                            is_liked: isLiked,
                            like_count: isLiked ? (n.like_count || 0) + 1 : (n.like_count || 1) - 1
                          };
                        }
                        return n;
                      }));
                    }}
                  />
                  <div className='flex items-center gap-1'>
                    <MessageCircle size={15} />
                    <span className='text-xs sm:text-sm'>{note.comments_count || 0}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Eye size={15} />
                    <span className='text-xs sm:text-sm'>{note.views || 0}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <button
                    className='hover:text-gray-800 transition'
                    onClick={(e) => handleEdit(note, e)}
                  >
                    <FaRegEdit size={15} />
                  </button>

                  <DeleteButton
                    targetId={note._id || note.id}
                    itemName="Note"
                    onDeleteSuccess={(deletedId) => {
                      setLocalNotes(prev => prev.filter(n => (n._id || n.id) !== deletedId));
                    }}
                  />

                  <button
                    className={`transition ${isBookmarked(note._id || note.id) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={(e) => handleBookmark(note, e)}
                  >
                    {isBookmarked(note._id || note.id) ? (
                      <BsBookmarkDashFill size={15} />
                    ) : (
                      <BsBookmarkDash size={15} />
                    )}
                  </button>

                  <ShareButton
                    targetId={note._id || note.id}
                    title={note.title}
                    text={note.text?.substring(0, 100) || 'Check out this note'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedNotes.length === 0 && !loading && (
          <div className='w-full flex justify-center py-20'>
            <p className='font-["Inter"] text-xl text-gray-500'>No notes found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default My_notes_page