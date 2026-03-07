import React, { useState, useEffect } from 'react';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload } from 'react-icons/md';
import { LuEye, LuBookmarkMinus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { IoChevronBack, IoHeart, IoHeartOutline } from 'react-icons/io5';
import { api } from '../../util/api';
import { CONFIG, getMediaUrl } from '../../config';
import FollowChip from '../common/FollowChip';


const NoteModal = ({ note, onClose }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [postingComment, setPostingComment] = useState(false);
    const [isLiked, setIsLiked] = useState(note.is_liked || false);
    const [likeCount, setLikeCount] = useState(note.like_count || 0);

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

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/content/${noteId}/like`);
            if (response.success) {
                setIsLiked(response.is_liked);
                setLikeCount(prev => response.is_liked ? prev + 1 : Math.max(prev - 1, 0));
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

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
                            <span className="text-[11px] text-gray-400">recent</span>
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

            {/* ── Container ────────────────────────────────────────── */}
            <div
                className="relative z-10 bg-white w-full flex flex-col h-[100dvh] md:h-auto md:rounded-2xl md:shadow-2xl md:max-w-2xl md:max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── Mobile top nav bar ───────────────────────────── */}
                <div className="md:hidden flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 flex-shrink-0 bg-white">
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0">
                        <IoChevronBack size={20} className="text-gray-700" />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 truncate flex-1">Back</span>
                </div>

                {/* ── Desktop header (unchanged) ───────────────────── */}
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

                {/* ── Scrollable body ───────────────────────────────── */}
                <div className="flex-1 overflow-y-auto bg-[#EEF2E1] md:bg-white">

                    {/* ═══════════════════════════════════════════════
                        MOBILE LAYOUT — matches the sketch
                    ═══════════════════════════════════════════════ */}
                    <div className="md:hidden flex flex-col gap-3 p-3 pb-24">

                        {/* ── Card 1: Note info ─────────────────────── */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">

                            {/* Tags + title + author */}
                            <div className="px-4 pt-4 pb-3">
                                {/* Tags */}
                                {note.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {note.tags.map((tag, i) => (
                                            <span key={i} className="text-[11px] px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Title */}
                                <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{note.title}</h2>

                                {/* Author */}
                                <div className="flex items-center gap-2">
                                    {note.author_profile_picture_url ? (
                                        <img src={getMediaUrl(note.author_profile_picture_url)} alt={note.author_username} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {note.author_username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        {note.author_username || 'Unknown'}
                                        <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 mx-4" />

                            {/* Content + file */}
                            <div className="px-4 py-3">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {note.text || note.description}
                                </p>

                                {/* Attachments */}
                                {note.file_paths?.length > 0 && (
                                    <div className="mt-3 flex flex-col gap-2">
                                        {note.file_paths.map((file, i) => {
                                            const fileInfo = getFileIcon(file);
                                            const isImage = ['png','jpg','jpeg','webp'].includes(file.split('.').pop().toLowerCase());
                                            return (
                                                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                                                    {isImage && (
                                                        <img
                                                            src={getMediaUrl(`/uploads/${file}`)}
                                                            alt={file}
                                                            className="w-full max-h-[200px] object-contain bg-gray-50"
                                                        />
                                                    )}
                                                    <div className="flex items-center justify-between px-3 py-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className={`${fileInfo.color} text-white px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0`}>
                                                                {fileInfo.label}
                                                            </div>
                                                            <p className="text-xs text-gray-600 truncate max-w-[130px]">{file}</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button className="p-1.5 hover:bg-gray-200 rounded-lg text-blue-500" onClick={() => window.open(getMediaUrl(`/uploads/${file}`), '_blank')}>
                                                                <LuEye size={15} />
                                                            </button>
                                                            <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500" onClick={() => { const a = document.createElement('a'); a.href = getMediaUrl(`/uploads/${file}`); a.download = file; a.click(); }}>
                                                                <MdOutlineFileDownload size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 mx-4" />

                            {/* Action bar: edit · delete · like · views */}
                            <div className="flex items-center px-4 py-3 gap-5">
                                <button className="text-gray-400 hover:text-gray-600 transition">
                                    <LuPencil size={18} />
                                </button>
                                <button className="text-gray-400 hover:text-red-500 transition">
                                    <LuTrash2 size={18} />
                                </button>
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1 transition ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                >
                                    {isLiked ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
                                    <span className="text-xs font-medium">{likeCount}</span>
                                </button>
                                <div className="flex items-center gap-1 text-gray-400">
                                    <LuEye size={18} />
                                    <span className="text-xs font-medium">{note.views || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Card 2: Comments ──────────────────────── */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-4 pt-4 pb-3">
                                <h3 className="font-semibold text-gray-900 text-sm mb-3">Comments</h3>

                                {/* Comment input row */}
                                <form onSubmit={handleAddComment}>
                                    <div className="flex items-center gap-2">
                                        {/* Current user avatar placeholder */}
                                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold flex-shrink-0">
                                            U
                                        </div>
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
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

                                {/* Comment list */}
                                <div className="mt-3">
                                    {loadingComments ? (
                                        <p className="text-center text-sm text-gray-400 py-4">Loading comments...</p>
                                    ) : comments.length > 0 ? (
                                        renderComments(comments)
                                    ) : (
                                        <p className="text-center text-sm text-gray-400 py-4">No comments yet. Be the first!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ═══════════════════════════════════════════════
                        DESKTOP LAYOUT — unchanged
                    ═══════════════════════════════════════════════ */}
                    <div className="hidden md:block p-6">

                        {note.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {note.tags.map((tag, i) => (
                                    <span key={i} className="text-sm px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">{note.text || note.description}</p>
                        </div>

                        {note.file_paths?.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <GoPaperclip size={20} className="text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">Attachments ({note.file_paths.length})</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {note.file_paths.map((file, i) => {
                                        const fileInfo = getFileIcon(file);
                                        const isImage = ['png','jpg','jpeg','webp'].includes(file.split('.').pop().toLowerCase());
                                        return (
                                            <div key={i} className="flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                                {isImage && (
                                                    <div className="w-full bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100">
                                                        <img src={getMediaUrl(`/uploads/${file}`)} alt={file} className="max-h-[400px] object-contain rounded-lg" />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between p-4 bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`${fileInfo.color} text-white px-3 py-2 rounded-lg font-bold text-xs`}>{fileInfo.label}</div>
                                                        <p className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-xs">{file}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600" onClick={() => window.open(getMediaUrl(`/uploads/${file}`), '_blank')}><LuEye size={20} /></button>
                                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" onClick={() => { const a = document.createElement('a'); a.href = getMediaUrl(`/uploads/${file}`); a.download = file; a.click(); }}><MdOutlineFileDownload size={20} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>
                            <form onSubmit={handleAddComment} className="mb-6">
                                <div className="flex gap-2">
                                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" disabled={postingComment} />
                                    <button type="submit" disabled={postingComment || !newComment.trim()} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
                                        {postingComment ? '...' : 'Post'}
                                    </button>
                                </div>
                            </form>
                            {loadingComments ? (
                                <div className="text-center py-4 text-sm text-gray-400">Loading comments...</div>
                            ) : (
                                <div className="space-y-2">
                                    {comments.length > 0 ? renderComments(comments) : <div className="text-center py-8 text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</div>}
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