import React, { useState, useEffect } from 'react';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload } from 'react-icons/md';
import { LuEye } from 'react-icons/lu';
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
        const extension = filename.split('.').pop().toLowerCase();
        if (extension === 'pdf') {
            return { label: 'PDF', color: 'bg-green-600' };
        } else if (extension === 'xlsx' || extension === 'xls') {
            return { label: 'XLS', color: 'bg-green-600' };
        } else if (extension === 'docx' || extension === 'doc') {
            return { label: 'DOC', color: 'bg-blue-600' };
        } else {
            return { label: 'FILE', color: 'bg-gray-600' };
        }
    };

    const renderComments = (commentList, level = 0) => {
        return commentList.map((comment) => (
            <div key={comment._id} className={`mt-4 ${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
                <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold">
                        {comment.author_username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{comment.author_username || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400">2h ago</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                    </div>
                </div>
                {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
            </div>
        ));
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between rounded-t-2xl z-30">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {note.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            {note.author_profile_picture_url ? (
                                <img
                                    src={getMediaUrl(note.author_profile_picture_url)}
                                    alt={note.author_username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
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
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 hover:bg-gray-100 rounded-full transition text-2xl font-bold text-gray-600"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {note.tags?.map((tag, index) => (
                            <span
                                key={index}
                                className="text-sm px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            {note.text || note.description}
                        </p>
                    </div>

                    {/* Attachments */}
                    {note.file_paths?.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <GoPaperclip size={20} className="text-gray-600" />
                                <h3 className="font-semibold text-gray-900">
                                    Attachments ({note.file_paths.length})
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {note.file_paths.map((file, index) => {
                                    const fileInfo = getFileIcon(file);
                                    const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase());

                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                                        >
                                            {isImage && (
                                                <div className="w-full bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100">
                                                    <img
                                                        src={getMediaUrl(`/uploads/${file}`)}
                                                        alt={file}
                                                        className="max-h-[400px] object-contain rounded-lg"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between p-4 bg-white">
                                                <div className="flex items-center gap-3">
                                                    <div className={`${fileInfo.color} text-white px-3 py-2 rounded-lg font-bold text-xs`}>
                                                        {fileInfo.label}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-xs">{file}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600 hover:text-blue-700"
                                                        onClick={() => window.open(getMediaUrl(`/uploads/${file}`), '_blank')}
                                                        title="Open in new tab"
                                                    >
                                                        <LuEye size={20} />
                                                    </button>
                                                    <button
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = getMediaUrl(`/uploads/${file}`);
                                                            link.download = file;
                                                            link.click();
                                                        }}
                                                        title="Download"
                                                    >
                                                        <MdOutlineFileDownload size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>

                        {/* Add Comment Input */}
                        <form onSubmit={handleAddComment} className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    disabled={postingComment}
                                />
                                <button
                                    type="submit"
                                    disabled={postingComment || !newComment.trim()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                    {postingComment ? '...' : 'Post'}
                                </button>
                            </div>
                        </form>

                        {loadingComments ? (
                            <div className="text-center py-4 text-sm text-gray-400">Loading comments...</div>
                        ) : (
                            <div className="space-y-2">
                                {comments.length > 0 ? (
                                    renderComments(comments)
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;
