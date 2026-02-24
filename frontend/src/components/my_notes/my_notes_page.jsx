import React, { useState, useMemo } from 'react'
import { MessageCircle, Eye } from 'lucide-react'
import { IoHeartOutline, IoHeart } from "react-icons/io5"
import { FaRegEdit } from "react-icons/fa"
import { BsBookmarkDashFill, BsBookmarkDash } from "react-icons/bs"
import { myNotes } from '../../constants/My_notes_data'
import NoteModal from '../home/NoteModal'
import EditNoteModal from './Edit_note_modal'
import { useMyNotesContext } from '../../context/MyNotesContext'
import { useBookmarks } from '../../context/BookmarksContext'

const My_notes_page = () => {
  // Get search and sort from context
  const { searchQuery, sortBy } = useMyNotesContext();
  
  // Get bookmark functions from context
  const { toggleBookmark, isBookmarked } = useBookmarks();

  // State for modal
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  // State to manage notes (so we can update them)
  const [notes, setNotes] = useState(myNotes);

  // State to track likes for each note
  const [noteLikes, setNoteLikes] = useState(() => {
    // Initialize with original like counts
    const initialLikes = {};
    myNotes.forEach(note => {
      initialLikes[note.id] = {
        count: note.likes,
        isLiked: false
      };
    });
    return initialLikes;
  });

  // Calculate stats dynamically from myNotes data
  const stats = [
    { value: notes.length.toString(), label: 'Total notes' },
    { value: notes.reduce((sum, note) => sum + note.views, 0).toString(), label: 'Total views' },
    { value: notes.reduce((sum, note) => sum + (noteLikes[note.id]?.count || note.likes), 0).toString(), label: 'Total likes' }
  ]

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    // First, filter by search query
    let filtered = notes.filter(note => {
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.description.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

    // Then, sort based on sortBy
    let sorted = [...filtered];
    switch (sortBy) {
      case 'date_created':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'most_recent':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'title_az':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_za':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return sorted;
  }, [notes, searchQuery, sortBy]);

  // Handle like button click
  const handleLike = (noteId, e) => {
    e.stopPropagation(); // Prevent card click
    setNoteLikes(prev => ({
      ...prev,
      [noteId]: {
        count: prev[noteId].isLiked ? prev[noteId].count - 1 : prev[noteId].count + 1,
        isLiked: !prev[noteId].isLiked
      }
    }));
  };

  // Handle bookmark button click
  const handleBookmark = (note, e) => {
    e.stopPropagation(); // Prevent card click
    toggleBookmark(note);
  };

  // Handle edit button click
  const handleEdit = (note, e) => {
    e.stopPropagation(); // Prevent card click
    setEditingNote(note);
  };

  // Handle save edited note
  const handleSaveEdit = (updatedNote) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingNote(null);
  };

  // Handle card click to open modal
  const handleCardClick = (note) => {
    setSelectedNote(note);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedNote(null);
  };

  return (
    <div className='w-full h-full bg-[#EEF2E1] overflow-auto relative'>
      {/* Blur overlay - only shows when modal is open */}
      {(selectedNote || editingNote) && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-10" />
      )}

      <div className='px-8 py-6'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {stats.map((stat, index) => (
            <div key={index} className='bg-white rounded-xl p-6 shadow-sm'>
              <div className='text-4xl font-semibold mb-2'>{stat.value}</div>
              <div className='text-gray-600'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Notes Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredAndSortedNotes.map((note) => (
            <div 
              key={note.id} 
              className='bg-white rounded-xl p-6 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow'
              onClick={() => handleCardClick(note)}
            >
              {/* Title */}
              <h3 className='text-lg font-semibold text-gray-800 mb-3'>{note.title}</h3>
              
              {/* Author */}
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-6 h-6 bg-green-600 rounded-full'></div>
                <span className='text-sm font-medium text-gray-700'>{note.author}</span>
              </div>

              {/* Description */}
              <p className='text-sm text-gray-600 mb-4 flex-grow line-clamp-3'>
                {note.description}
              </p>

              {/* Attachments */}
              {note.attachments > 0 && (
                <div className='mb-4'>
                  <span className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                    📎 {note.attachments} Attachment(s)
                  </span>
                </div>
              )}

              {/* Tags */}
              <div className='flex flex-wrap gap-2 mb-4'>
                {note.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className='text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium'
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className='border-t border-gray-200 mb-4'></div>

              {/* Stats and Actions */}
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <div className='flex items-center gap-4'>
                  <button 
                    onClick={(e) => handleLike(note.id, e)}
                    className='flex items-center gap-1 hover:text-red-500 transition cursor-pointer'
                  >
                    {noteLikes[note.id]?.isLiked ? (
                      <IoHeart size={16} className='text-red-500' />
                    ) : (
                      <IoHeartOutline size={16} />
                    )}
                    <span className={noteLikes[note.id]?.isLiked ? 'text-red-500' : ''}>
                      {noteLikes[note.id]?.count || note.likes}
                    </span>
                  </button>
                  <div className='flex items-center gap-1'>
                    <MessageCircle size={16} />
                    <span>{note.comments}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Eye size={16} />
                    <span>{note.views}</span>
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
                    className={`transition ${isBookmarked(note.id) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={(e) => handleBookmark(note, e)}
                  >
                    {isBookmarked(note.id) ? (
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

      {/* Modal */}
      {selectedNote && (
        <NoteModal note={selectedNote} onClose={handleCloseModal} />
      )}

      {/* Edit Modal */}
      {editingNote && (
        <EditNoteModal 
          note={editingNote} 
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

export default My_notes_page