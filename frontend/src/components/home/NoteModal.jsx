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

    const isImageFile = (f) =>
        ['png', 'jpg', 'jpeg', 'webp'].includes(f.split('.').pop().toLowerCase());

    const renderComments = (commentList, level = 0) =>
        commentList.map((comment) => (
            <div key={comment._id} className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-3' : ''} mt-4`}>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-700 font-bold flex-shrink-0">
                        {comment.author_username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-gray-800">{comment.author_username || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400">recent</span>
                        </div>
                        <p className="text-sm text-gray-600 break-words leading-relaxed">{comment.text}</p>
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div
                className="relative z-10 bg-white w-full flex flex-col h-[100dvh] sm:h-auto sm:rounded-2xl sm:shadow-2xl sm:max-w-lg md:max-w-2xl sm:max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Top nav bar ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition"
                    >
                        <IoChevronBack size={18} />
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    {/* Edit + delete — top right, not crammed next to author */}
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            <LuPencil size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <LuTrash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable content ── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-5 pt-5 pb-8 flex flex-col gap-4">

                        {/* Tags */}
                        {note.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {note.tags.map((tag, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {note.title}
                        </h2>

                        {/* Author row — clean, standalone */}
                        <div className="flex items-center gap-3">
                            {note.author_profile_picture_url ? (
                                <img
                                    src={getMediaUrl(note.author_profile_picture_url)}
                                    alt={note.author_username}
                                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {note.author_username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {note.author_username || 'Unknown'}
                                    </span>
                                    <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                </div>
                                <p className="text-xs text-gray-400">Published recently</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* Body */}
                        <p className="text-[15px] text-gray-700 leading-relaxed">
                            {note.text || note.description}
                        </p>

                        {/* Attachments */}
                        {note.file_paths?.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <GoPaperclip size={13} />
                                    <span className="text-xs font-semibold uppercase tracking-wide">
                                        Attachments · {note.file_paths.length}
                                    </span>
                                </div>
                                {note.file_paths.map((file, i) => {
                                    const fileInfo = getFileIcon(file);
                                    const isImg = isImageFile(file);
                                    return (
                                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                                            {isImg && (
                                                <img
                                                    src={getMediaUrl(`/uploads/${file}`)}
                                                    alt={file}
                                                    className="w-full max-h-56 object-contain bg-gray-50"
                                                />
                                            )}
                                            <div className="flex items-center justify-between px-3 py-2.5 bg-white">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`${fileInfo.color} text-white px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0`}>
                                                        {fileInfo.label}
                                                    </span>
                                                    <span className="text-xs text-gray-600 truncate">{file}</span>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-500 transition"
                                                        onClick={() => window.open(getMediaUrl(`/uploads/${file}`), '_blank')}
                                                    >
                                                        <LuEye size={15} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"
                                                        onClick={() => { const a = document.createElement('a'); a.href = getMediaUrl(`/uploads/${file}`); a.download = file; a.click(); }}
                                                    >
                                                        <MdOutlineFileDownload size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Like / views */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 text-sm font-medium transition ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                            >
                                {isLiked ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
                                <span>{likeCount}</span>
                            </button>
                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                <LuEye size={17} />
                                <span>{note.views || 0}</span>
                            </div>
                        </div>

                        {/* ── Comments ── */}
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-bold text-gray-900 mb-4">Comments</h3>

                            <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-700 font-bold flex-shrink-0">
                                    U
                                </div>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 transition min-w-0"
                                    disabled={postingComment}
                                />
                                <button
                                    type="submit"
                                    disabled={postingComment || !newComment.trim()}
                                    className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition flex-shrink-0"
                                >
                                    {postingComment ? '…' : 'Post'}
                                </button>
                            </form>

                            {loadingComments ? (
                                <p className="text-center text-sm text-gray-400 py-6">Loading comments…</p>
                            ) : comments.length > 0 ? (
                                <div>{renderComments(comments)}</div>
                            ) : (
                                <p className="text-center text-sm text-gray-400 py-6">
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