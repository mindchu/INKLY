import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Eye } from 'lucide-react'
import { IoHeartOutline, IoHeart } from "react-icons/io5"
import { FaRegEdit } from "react-icons/fa"
import { BsBookmarkDashFill, BsBookmarkDash } from "react-icons/bs"
import { MdDelete } from 'react-icons/md';
import NoteModal from '../home/NoteModal'
import { useMyNotesContext } from '../../context/MyNotesContext'
import { useBookmarks } from '../../context/BookmarksContext'
import { api } from '../../util/api'
import FollowChip from '../common/FollowChip'

const My_notes_page = () => {
  const navigate = useNavigate();
  const { searchQuery, sortBy, documents, discussions, loading } = useMyNotesContext();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const [selectedNote, setSelectedNote] = useState(null);
  const [localNotes, setLocalNotes] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLocalNotes([...documents]);
  }, [documents]);

  const stats = [
    { value: localNotes.length.toString(), label: 'Total items' },
    { value: localNotes.reduce((sum, note) => sum + (note.views || 0), 0).toString(), label: 'Total views' },
    { value: localNotes.reduce((sum, note) => sum + (note.likes_count || 0), 0).toString(), label: 'Total likes' }
  ]

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = localNotes.filter(note => {
      const query = searchQuery.toLowerCase();
      return (
        (note.title || '').toLowerCase().includes(query) ||
        (note.text || '').toLowerCase().includes(query) ||
        (note.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    });

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

  const handleLike = async (noteId, e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/content/${noteId}/like`);
      if (response.success) {
        setLocalNotes(prev => prev.map(note => {
          if ((note._id || note.id) === noteId) {
            return {
              ...note,
              is_liked: response.is_liked,
              likes_count: response.is_liked ? (note.likes_count || 0) + 1 : (note.likes_count || 1) - 1
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

  const handleEdit = (note, e) => {
    e.stopPropagation();
    navigate(`/edit/${note._id || note.id}`);
  };

  const handleDeleteClick = (note, e) => {
    e.stopPropagation();
    setItemToDelete(note);
    setShowDeleteConfirm(true);
  };

  const handleDeleteNote = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const noteId = itemToDelete._id || itemToDelete.id;
    try {
      const response = await api.delete(`/content/${noteId}`);
      if (response.success) {
        setLocalNotes(prev => prev.filter(note => (note._id || note.id) !== noteId));
      } else {
        console.error('Failed to delete note:', response.message);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const handleCardClick = (note) => {
    // setSelectedNote(note);
    navigate(`/content/${note._id || note.id}`);
  };

  const handleCloseModal = () => {
    setSelectedNote(null);
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

      <div className='px-8 py-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {stats.map((stat, index) => (
            <div key={index} className='bg-white rounded-xl p-6 shadow-sm'>
              <div className='text-4xl font-semibold mb-2'>{stat.value}</div>
              <div className='text-gray-600'>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredAndSortedNotes.map((note) => (
            <div
              key={note._id || note.id}
              className='bg-white rounded-xl p-6 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow'
              onClick={() => handleCardClick(note)}
            >
              <h3 className='text-lg font-semibold text-gray-800 mb-3'>{note.title}</h3>

              <div className='flex items-center gap-2 mb-3'>
                {note.author_profile_picture_url ? (
                  <img
                    src={note.author_profile_picture_url.startsWith('http') ? note.author_profile_picture_url : `${import.meta.env.VITE_API_URL || 'http://localhost:6001/api'}${note.author_profile_picture_url.replace('/api', '')}`}
                    alt={note.author_username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold'>
                    {note.author_username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                  {note.author_username || 'Me'}
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
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:6001/api'}/uploads/${note.file_paths.find(file => ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase()))}`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {(note.file_paths?.length > 0) && (
                <div className='mb-4'>
                  <span className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                    📎 {note.file_paths.length} Attachment(s)
                  </span>
                </div>
              )}

              <div className='flex flex-wrap gap-2 mb-4'>
                {note.tags?.map((tag, tagIndex) => (
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
                      {note.likes_count || 0}
                    </span>
                  </button>
                  <div className='flex items-center gap-1'>
                    <MessageCircle size={16} />
                    <span>{note.comments_count || 0}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Eye size={16} />
                    <span>{note.views || 0}</span>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    className='hover:text-gray-800 transition'
                    onClick={(e) => handleEdit(note, e)}
                  >
                    <FaRegEdit size={16} />
                  </button>
                  <button
                    className='hover:text-red-500 transition'
                    onClick={(e) => handleDeleteClick(note, e)}
                    title="Delete Note"
                  >
                    <MdDelete size={18} />
                  </button>
                  <button
                    className={`transition ${isBookmarked(note._id || note.id) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={(e) => handleBookmark(note, e)}
                  >
                    {isBookmarked(note._id || note.id) ? (
                      <BsBookmarkDashFill size={16} />
                    ) : (
                      <BsBookmarkDash size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* {selectedNote && (
        <NoteModal note={selectedNote} onClose={handleCloseModal} />
      )} */}


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
              <MdDelete size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Note?</h3>
            <p className="text-gray-500 text-center mb-8">
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNote}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default My_notes_page
