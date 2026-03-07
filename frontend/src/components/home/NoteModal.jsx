import React, { useState, useEffect } from 'react';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload } from 'react-icons/md';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
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
        if (ext === 'pdf')                   return { label: 'PDF',  color: 'bg-red-500' };
        if (ext === 'xlsx' || ext === 'xls') return { label: 'XLS',  color: 'bg-green-600' };
        if (ext === 'docx' || ext === 'doc') return { label: 'DOC',  color: 'bg-blue-600' };
        return { label: 'FILE', color: 'bg-gray-500' };
    };

    const renderComments = (commentList, level = 0) =>
        commentList.map((comment) => (
            <div key={comment._id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-100 pl-3' : ''} mt-3`}>
                <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold flex-shrink-0">
                        {comment.author_username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
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
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative z-10 bg-white w-full flex flex-col h-[100dvh] md:h-auto md:rounded-2xl md:shadow-2xl md:max-w-2xl md:max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── MOBILE TOP NAV ── */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
                    <button onClick={onClose} className="flex items-center gap-1.5 text-gray-600">
                        <IoChevronBack size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
                            <LuPencil size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                            <LuTrash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* ── DESKTOP HEADER — untouched ── */}
                <div className="hidden md:flex items-start justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 break-words">{note.title}</h2>
                        <div className="flex items-center gap-3">
                            {note.author_profile_picture_url ? (
                                <img src={getMediaUrl(note.author_profile_picture_url)} alt={note.author_username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                    {note.author_username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                                    {note.author_username || 'Unknown'}
                                    <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                </p>
                                <p className="text-sm text-gray-500">Posted recently</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="ml-4 p-2 hover:bg-gray-100 rounded-full transition text-2xl font-bold text-gray-600 flex-shrink-0">×</button>
                </div>

                {/* ── SCROLLABLE BODY ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">

                    {/* ══ MOBILE ══ */}
                    <div className="md:hidden bg-[#EEF2E1] flex flex-col gap-3 p-3 pb-24">

                        {/* CARD 1: Note */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                            {/* Row 1: Tags + Title */}
                            <div className="px-4 pt-4 pb-3">
                                {note.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                                        {note.tags.map((tag, i) => (
                                            <span key={i} className="text-[11px] px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-gray-900 leading-snug break-words">
                                    {note.title}
                                </h2>
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* Row 2: Author only — NO icons here */}
                            <div className="px-4 py-3 flex items-center gap-3">
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
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-semibold text-gray-800">
                                            {note.author_username || 'Unknown'}
                                        </span>
                                        <FollowChip authorId={note.author_id} initialIsFollowing={note.is_following} />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Published recently</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* Row 3: Like + Views — completely separate row */}
                            <div className="px-4 py-2.5 flex items-center gap-5 bg-gray-50">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 transition ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                >
                                    {isLiked ? <IoHeart size={16} /> : <IoHeartOutline size={16} />}
                                    <span className="text-xs font-medium">{likeCount}</span>
                                </button>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <LuEye size={16} />
                                    <span className="text-xs font-medium">{note.views || 0}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* Row 4: Body content */}
                            <div className="px-4 py-4">
                                <p className="text-sm text-gray-600 leading-relaxed break-words">
                                    {note.text || note.description}
                                </p>
                                {note.file_paths?.length > 0 && (
                                    <div className="mt-3 flex flex-col gap-2">
                                        {note.file_paths.map((file, i) => {
                                            const fileInfo = getFileIcon(file);
                                            const isImage = ['png','jpg','jpeg','webp'].includes(file.split('.').pop().toLowerCase());
                                            return (
                                                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                                                    {isImage && (
                                                        <img src={getMediaUrl(`/uploads/${file}`)} alt={file} className="w-full max-h-48 object-contain bg-gray-50" />
                                                    )}
                                                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                            <span className={`${fileInfo.color} text-white px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0`}>{fileInfo.label}</span>
                                                            <span className="text-xs text-gray-600 truncate">{file}</span>
                                                        </div>
                                                        <div className="flex gap-1 flex-shrink-0 ml-2">
                                                            <button className="p-1.5 hover:bg-gray-200 rounded-lg text-blue-500" onClick={() => window.open(getMediaUrl(`/uploads/${file}`), '_blank')}><LuEye size={14} /></button>
                                                            <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500" onClick={() => { const a = document.createElement('a'); a.href = getMediaUrl(`/uploads/${file}`); a.download = file; a.click(); }}><MdOutlineFileDownload size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CARD 2: Comments */}
                        <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
                            <h3 className="font-bold text-gray-900 text-base mb-3">Comments</h3>

                            <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold flex-shrink-0">
                                    U
                                </div>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    disabled={postingComment}
                                />
                                <button
                                    type="submit"
                                    disabled={postingComment || !newComment.trim()}
                                    className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition flex-shrink-0"
                                >
                                    {postingComment ? '…' : 'Post'}
                                </button>
                            </form>

                            {loadingComments ? (
                                <p className="text-center text-sm text-gray-400 py-4">Loading comments…</p>
                            ) : comments.length > 0 ? (
                                renderComments(comments)
                            ) : (
                                <p className="text-center text-sm text-gray-400 py-6">
                                    No comments yet. Be the first to join the conversation!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ══ DESKTOP — untouched ══ */}
                    <div className="hidden md:block p-6">
                        {note.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {note.tags.map((tag, i) => (
                                    <span key={i} className="text-sm px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium">#{tag}</span>
                                ))}
                            </div>
                        )}
                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed break-words">{note.text || note.description}</p>
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
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className={`${fileInfo.color} text-white px-3 py-2 rounded-lg font-bold text-xs flex-shrink-0`}>{fileInfo.label}</div>
                                                        <p className="font-medium text-gray-900 truncate">{file}</p>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0 ml-3">
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
                                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" disabled={postingComment} />
                                    <button type="submit" disabled={postingComment || !newComment.trim()} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition flex-shrink-0">
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
                        <div className="flex items-center gap-5 mt-6 pt-4 border-t border-gray-100">
                            <button className="text-gray-400 hover:text-gray-600 transition"><LuPencil size={17} /></button>
                            <button className="text-gray-400 hover:text-red-500 transition"><LuTrash2 size={17} /></button>
                            <button onClick={handleLike} className={`flex items-center gap-1 transition ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                                {isLiked ? <IoHeart size={17} /> : <IoHeartOutline size={17} />}
                                <span className="text-xs font-medium">{likeCount}</span>
                            </button>
                            <div className="flex items-center gap-1 text-gray-400">
                                <LuEye size={17} />
                                <span className="text-xs font-medium">{note.views || 0}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NoteModal;