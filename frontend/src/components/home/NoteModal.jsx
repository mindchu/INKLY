import React, { useState, useEffect } from 'react';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload } from 'react-icons/md';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { IoChevronBack, IoHeart, IoHeartOutline } from 'react-icons/io5';
import { api } from '../../util/api';
import { getMediaUrl } from '../../config';
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

    const isImageFile = (filename) =>
        ['png', 'jpg', 'jpeg', 'webp'].includes(filename.split('.').pop().toLowerCase());

    const renderComments = (commentList, level = 0) =>
        commentList.map((comment) => (
            <div key={comment._id} className={`${level > 0 ? 'ml-6 sm:ml-8 border-l-2 border-gray-100 pl-3' : ''} mt-3`}>
                <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold flex-shrink-0">
                        {comment.author_username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal shell */}
            <div
                className="
                    relative z-10 bg-white w-full flex flex-col
                    h-[100dvh]
                    sm:h-auto sm:rounded-2xl sm:shadow-2xl
                    sm:max-w-lg md:max-w-xl lg:max-w-2xl
                    sm:max-h-[90vh]
                    overflow-hidden
                "
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex-shrink-0 bg-white">
                    {/* Back arrow — only on mobile (hidden sm+) */}
                    <button
                        onClick={onClose}
                        className="sm:hidden p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                    >
                        <IoChevronBack size={20} className="text-gray-700" />
                    </button>

                    {/* Author avatar + meta — grows to fill space */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {note.author_profile_picture_url ? (
                            <img
                                src={getMediaUrl(note.author_profile_picture_url)}
                                alt={note.author_username}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {note.author_username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 flex items-center gap-1.5 flex-wrap">
                                {note.author_username || 'Unknown'}
                                <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                            </p>
                            <p className="text-xs text-gray-400">Posted recently</p>
                        </div>
                    </div>

                    {/* Close — only on sm+ */}
                    <button
                        onClick={onClose}
                        className="hidden sm:flex items-center justify-center p-2 hover:bg-gray-100 rounded-full transition text-xl font-bold text-gray-500 flex-shrink-0"
                    >
                        ×
                    </button>
                </div>

                {/* ── Scrollable body ─────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 flex flex-col gap-5">

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                            {note.title}
                        </h2>

                        {/* Tags */}
                        {note.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {note.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Body text */}
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            {note.text || note.description}
                        </p>

                        {/* Attachments */}
                        {note.file_paths?.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <GoPaperclip size={16} className="text-gray-500" />
                                    <h3 className="font-semibold text-sm text-gray-800">
                                        Attachments ({note.file_paths.length})
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {note.file_paths.map((file, i) => {
                                        const fileInfo = getFileIcon(file);
                                        const isImg = isImageFile(file);
                                        return (
                                            <div
                                                key={i}
                                                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                {isImg && (
                                                    <img
                                                        src={getMediaUrl(`/uploads/${file}`)}
                                                        alt={file}
                                                        className="w-full max-h-48 sm:max-h-72 object-contain bg-gray-50"
                                                    />
                                                )}
                                                <div className="flex items-center justify-between px-3 py-2.5 bg-white">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={`${fileInfo.color} text-white px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0`}>
                                                            {fileInfo.label}
                                                        </div>
                                                        <p className="text-xs text-gray-600 truncate max-w-[140px] sm:max-w-xs">
                                                            {file}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        <button
                                                            className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-500 transition"
                                                            onClick={() => window.open(getMediaUrl(`/uploads/${file}`), '_blank')}
                                                        >
                                                            <LuEye size={16} />
                                                        </button>
                                                        <button
                                                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"
                                                            onClick={() => {
                                                                const a = document.createElement('a');
                                                                a.href = getMediaUrl(`/uploads/${file}`);
                                                                a.download = file;
                                                                a.click();
                                                            }}
                                                        >
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

                        {/* Action bar */}
                        <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition">
                                <LuPencil size={17} />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-500 transition">
                                <LuTrash2 size={17} />
                            </button>
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 transition ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                            >
                                {isLiked ? <IoHeart size={17} /> : <IoHeartOutline size={17} />}
                                <span className="text-xs font-medium">{likeCount}</span>
                            </button>
                            <div className="flex items-center gap-1 text-gray-400">
                                <LuEye size={17} />
                                <span className="text-xs font-medium">{note.views || 0}</span>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3">Comments</h3>

                            {/* Comment input */}
                            <form onSubmit={handleAddComment} className="mb-4">
                                <div className="flex items-center gap-2">
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
                                        {postingComment ? '…' : 'Post'}
                                    </button>
                                </div>
                            </form>

                            {/* Comment list */}
                            {loadingComments ? (
                                <p className="text-center text-sm text-gray-400 py-4">Loading comments…</p>
                            ) : comments.length > 0 ? (
                                renderComments(comments)
                            ) : (
                                <p className="text-center text-sm text-gray-400 py-4">
                                    No comments yet. Be the first!
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;