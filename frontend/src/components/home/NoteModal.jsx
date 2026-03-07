import React, { useState, useEffect } from 'react';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload } from 'react-icons/md';
import { LuEye } from 'react-icons/lu';
import { IoChevronBack } from 'react-icons/io5';
import { api } from '../../util/api';
import { CONFIG, getMediaUrl } from '../../config';
import FollowChip from '../common/FollowChip';


const NoteModal = ({ note, onClose }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [postingComment, setPostingComment] = useState(false);

    const noteId = note._id || note.id;

    useEffect(() => {
        const fetchDetails = async () => {
            setLoadingComments(true);
            try {
                const data = await api.get(`/content/${noteId}`);
                setComments(data.comments || []);
            } catch (error) {
                console.error('Failed to fetch note details:', error);
            } finally {
                setLoadingComments(false);
            }
        };
        fetchDetails();
    }, [noteId]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setPostingComment(true);
        try {
            const response = await api.post(`/content/${noteId}/comment`, { text: newComment });
            if (response.success) {
                setComments(prev => [...prev, response.data]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setPostingComment(false);
        }
    };

    if (!note) return null;

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'pdf')                    return { label: 'PDF',  color: 'bg-red-500' };
        if (ext === 'xlsx' || ext === 'xls')  return { label: 'XLS',  color: 'bg-green-600' };
        if (ext === 'docx' || ext === 'doc')  return { label: 'DOC',  color: 'bg-blue-600' };
        return { label: 'FILE', color: 'bg-gray-500' };
    };

    const renderComments = (commentList, level = 0) => {
        return commentList.map((comment) => (
            <div key={comment._id} className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-3' : ''} mt-3`}>
                <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold flex-shrink-0">
                        {comment.author_username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className='min-w-0 flex-1'>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-gray-800">{comment.author_username || 'Anonymous'}</span>
                            <span className="text-[11px] text-gray-400">2h ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 break-words">{comment.text}</p>
                    </div>
                </div>
                {comment.replies?.length > 0 && renderComments(comment.replies, level + 1)}
            </div>
        ));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40" />

            {/* Mobile: full screen. Desktop: centered modal */}
            <div
                className="relative z-10 bg-white w-full flex flex-col h-[100dvh] md:h-auto md:rounded-2xl md:shadow-2xl md:max-w-2xl md:max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── Header ──────────────────────────────────────────── */}
                {/* Mobile */}
                <div className="md:hidden flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 flex-shrink-0 bg-white">
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0">
                        <IoChevronBack size={20} className="text-gray-700" />
                    </button>
                    <h2 className="text-sm font-semibold text-gray-900 truncate flex-1">{note.title}</h2>
                    {note.type && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${
                            note.type === 'post'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}>
                            {note.type === 'post' ? 'Note' : 'Disc.'}
                        </span>
                    )}
                </div>

                {/* Desktop */}
                <div className="hidden md:flex items-start justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{note.title}</h2>
                        <div className="flex items-center gap-3">
                            {note.author_profile_picture_url ? (
                                <img src={getMediaUrl(note.author_profile_picture_url)} alt={note.author_username} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {note.author_username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    {note.author_username || 'Unknown'}
                                    <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                </p>
                                <p className="text-sm text-gray-500">Posted recently</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="ml-4 p-2 hover:bg-gray-100 rounded-full transition text-2xl font-bold text-gray-600">×</button>
                </div>

                {/* ── Scrollable content ───────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-3 md:p-6">

                        {/* Mobile: compact author + meta row */}
                        <div className="flex items-center gap-2.5 mb-3 md:hidden">
                            {note.author_profile_picture_url ? (
                                <img src={getMediaUrl(note.author_profile_picture_url)} alt={note.author_username} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                    {note.author_username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-800 flex items-center gap-1.5 flex-wrap">
                                    {note.author_username || 'Unknown'}
                                    <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                </p>
                                <p className="text-[11px] text-gray-400">Posted recently</p>
                            </div>
                        </div>

                        {/* Tags */}
                        {note.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {note.tags.map((tag, i) => (
                                    <span key={i} className="text-[11px] md:text-sm px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Body */}
                        <p className="text-gray-700 leading-relaxed text-sm mb-4">
                            {note.text || note.description}
                        </p>

                        {/* Attachments */}
                        {note.file_paths?.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <GoPaperclip size={14} className="text-gray-500" />
                                    <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">
                                        Attachments ({note.file_paths.length})
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {note.file_paths.map((file, i) => {
                                        const fileInfo = getFileIcon(file);
                                        const isImage = ['png','jpg','jpeg','webp'].includes(file.split('.').pop().toLowerCase());
                                        return (
                                            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                                                {isImage && (
                                                    <div className="w-full bg-gray-50 flex items-center justify-center border-b border-gray-100">
                                                        <img
                                                            src={getMediaUrl(`/uploads/${file}`)}
                                                            alt={file}
                                                            className="max-h-[200px] md:max-h-[400px] w-full object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between px-3 py-2 bg-white">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={`${fileInfo.color} text-white px-2 py-1 rounded font-bold text-[10px] flex-shrink-0`}>
                                                            {fileInfo.label}
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-700 truncate max-w-[130px] md:max-w-xs">{file}</p>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition text-blue-500" onClick={() => window.open(getMediaUrl(`/uploads/${file}`), '_blank')}>
                                                            <LuEye size={16} />
                                                        </button>
                                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500" onClick={() => { const a = document.createElement('a'); a.href = getMediaUrl(`/uploads/${file}`); a.download = file; a.click(); }}>
                                                            <MdOutlineFileDownload size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        <div className="border-t border-gray-100 pt-3">
                            <h3 className="font-semibold text-gray-900 text-sm mb-3">Comments</h3>

                            <form onSubmit={handleAddComment} className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        disabled={postingComment}
                                    />
                                    <button
                                        type="submit"
                                        disabled={postingComment || !newComment.trim()}
                                        className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition flex-shrink-0"
                                    >
                                        {postingComment ? '...' : 'Post'}
                                    </button>
                                </div>
                            </form>

                            {loadingComments ? (
                                <div className="text-center py-4 text-sm text-gray-400">Loading comments...</div>
                            ) : (
                                <div className="space-y-1 pb-8">
                                    {comments.length > 0
                                        ? renderComments(comments)
                                        : <div className="text-center py-6 text-gray-400 text-sm">No comments yet. Be the first!</div>
                                    }
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;