// frontend/src/components/content_detail/ContentDetailPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload, MdArrowBack, MdDelete, MdEdit } from 'react-icons/md';
import { LuEye } from 'react-icons/lu';
import { IoHeartOutline, IoHeart, IoArrowForward } from "react-icons/io5";
import { api } from '../../util/api';
// import { CONFIG } from '../../config'; // Uncomment if you move the base URL here
import FollowChip from '../common/FollowChip';
import { useProfileContext } from '../../context/ProfileContext';

// --- Helper Functions ---

// Centralized URL formatting to keep the component DRY
const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6001/api';
    return `${baseUrl}${path.replace('/api', '')}`;
};

// Recursive function to update the comment tree locally without refetching the whole page
const addReplyToTree = (comments, parentId, newReply) => {
    return comments.map(comment => {
        if (comment._id === parentId) {
            return { ...comment, replies: [...(comment.replies || []), newReply] };
        }
        if (comment.replies?.length > 0) {
            return { ...comment, replies: addReplyToTree(comment.replies, parentId, newReply) };
        }
        return comment;
    });
};

const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf': return { label: 'PDF', color: 'bg-green-600' };
        case 'xlsx':
        case 'xls': return { label: 'XLS', color: 'bg-green-600' };
        case 'docx':
        case 'doc': return { label: 'DOC', color: 'bg-blue-600' };
        default: return { label: 'FILE', color: 'bg-gray-600' };
    }
};

const ContentDetailPage = () => {
    const { profileData } = useProfileContext();
    const { contentId } = useParams();
    const navigate = useNavigate();

    // Core State
    const [content, setContent] = useState(null);
    const [comments, setComments] = useState([]);

    // UI/Loading State
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [postingComment, setPostingComment] = useState(false);
    const [postingReply, setPostingReply] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Input State
    const [newComment, setNewComment] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    const lastFetchedId = useRef(null);

    // --- Effects ---
    useEffect(() => {
        const fetchContent = async () => {
            if (lastFetchedId.current === contentId) return;
            lastFetchedId.current = contentId;
            setLoading(true);
            try {
                const response = await api.get(`/content/${contentId}`);

                console.log("🔍 DATA FROM BACKEND:", response.data);

                setContent(response.data);
                setComments(response.comments || []);
            } catch (error) {
                console.error('Failed to fetch content details:', error);
                lastFetchedId.current = null;
            } finally {
                setLoading(false);
                setLoadingComments(false);
            }
        };
        fetchContent();
    }, [contentId]);

    // --- Handlers ---
    const handleLike = async () => {
        try {
            const response = await api.post(`/content/${contentId}/like`);
            if (response.success) {
                setContent(prev => ({
                    ...prev,
                    is_liked: response.is_liked,
                    like_count: response.is_liked ? (prev.like_count || 0) + 1 : (prev.like_count || 1) - 1
                }));
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const response = await api.delete(`/content/${contentId}`);
            if (response.success) {
                navigate('/home');
            } else {
                console.error('Failed to delete content:', response.message);
            }
        } catch (error) {
            console.error('Failed to delete content:', error);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setPostingComment(true);
        try {
            const response = await api.post(`/content/${contentId}/comment`, { text: newComment });
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

    const handleReply = async (parentId) => {
        if (!replyText.trim()) return;

        setPostingReply(true);
        try {
            const response = await api.post(`/content/${contentId}/comment`, {
                text: replyText,
                parent_id: parentId
            });
            if (response.success) {
                // Update local state recursively instead of refetching the whole page!
                setComments(prev => addReplyToTree(prev, parentId, response.data));
                setReplyText('');
                setReplyingTo(null);
            }
        } catch (error) {
            console.error('Failed to post reply:', error);
        } finally {
            setPostingReply(false);
        }
    };

    // --- Render Helpers ---
    const renderComments = (commentList, level = 0) => {
        return commentList.map((comment) => (
            <div key={comment._id} className={`mt-4 ${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
                <div className="flex items-start gap-2">
                    {comment.author_profile_picture_url ? (
                        <img
                            src={getMediaUrl(comment.author_profile_picture_url)}
                            alt={comment.author_username}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold flex-shrink-0">
                            {comment.author_username?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{comment.author_username || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400">recent</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>

                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                className="text-xs text-green-600 font-medium hover:underline"
                            >
                                {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                            </button>
                        </div>

                        {replyingTo === comment._id && (
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Reply to ${comment.author_username || 'user'}...`}
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleReply(comment._id)}
                                    disabled={postingReply || !replyText.trim()}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    Reply
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recursion Guard: Limit to 2 levels deep */}
                {level < 2 ? (
                    comment.replies?.length > 0 && renderComments(comment.replies, level + 1)
                ) : (
                    comment.replies?.length > 0 && (
                        <div className="mt-4 ml-8">
                            <Link
                                to={`/content/${contentId}/comment/${comment._id}`}
                                className="flex items-center gap-2 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-3 py-2 rounded-lg w-fit"
                            >
                                <span>View more replies</span>
                                <IoArrowForward size={14} />
                            </Link>
                        </div>
                    )
                )}
            </div>
        ));
    };

    // --- Loading & Error States ---
    if (loading) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading content...</div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-lg font-medium text-gray-600'>Content not found</div>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Back Button */}
                <button
                    onClick={() => {
                        if (content.type === 'discussion') {
                            navigate('/discussion');
                        } else if (content.type === 'post') {
                            navigate('/note_forum');
                        } else {
                            navigate(-1);
                        }
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-700 mb-6 transition-colors font-medium"
                >
                    <MdArrowBack size={20} />
                    <span>Back</span>
                </button>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {content.tags?.map((tag, index) => (
                                <span key={index} className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 break-all">{content.title}</h1>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {content.author_profile_picture_url ? (
                                    <img
                                        src={getMediaUrl(content.author_profile_picture_url)}
                                        alt={content.author_username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                                        {content.author_username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                                        {content.author_username || 'Unknown'}
                                        <FollowChip authorId={content.author_id} initialIsFollowing={content.is_following} />
                                    </p>
                                    <p className="text-sm text-gray-500">Published recently</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-gray-400">
                                {profileData && profileData.google_id === content.author_id && (
                                    <>
                                        <button onClick={() => navigate(`/edit/${contentId}`)} className="flex items-center gap-2 hover:text-blue-500 transition-colors" title="Edit Content">
                                            <MdEdit size={24} />
                                        </button>
                                        <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 hover:text-red-500 transition-colors" title="Delete Content">
                                            <MdDelete size={24} />
                                        </button>
                                    </>
                                )}
                                <button onClick={handleLike} className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                    {content.is_liked ? <IoHeart size={24} className="text-red-500" /> : <IoHeartOutline size={24} />}
                                    <span className={content.is_liked ? 'text-red-500 font-medium' : 'font-medium'}>
                                        {content.like_count || 0} {/* Changed from likes_count to like_count! */}
                                    </span>
                                </button>
                                <div className="flex items-center gap-2">
                                    <LuEye size={24} />
                                    <span className="font-medium">{content.views || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                        {/* Note: If content.text is raw HTML, consider using:
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.text) }} />
                        */}
                        <div className="prose prose-green max-w-none text-gray-700 leading-relaxed text-lg mb-8 whitespace-pre-wrap break-all">
                            {content.text}
                        </div>

                        {/* Attachments */}
                        {content.file_paths?.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <GoPaperclip size={24} className="text-gray-600" />
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Attachments ({content.file_paths.length})
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {content.file_paths.map((file, index) => {
                                        const fileInfo = getFileIcon(file);
                                        const fileUrl = getMediaUrl(`/uploads/${file}`);
                                        const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase());

                                        return (
                                            <div key={index} className="flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                                                {isImage && (
                                                    <div className="w-full bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100">
                                                        <img src={fileUrl} alt={file} className="max-h-[300px] object-contain rounded-lg" />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between p-4 bg-white">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`${fileInfo.color} text-white px-3 py-1.5 rounded-lg font-bold text-xs flex-shrink-0`}>
                                                            {fileInfo.label}
                                                        </div>
                                                        <p className="font-medium text-gray-900 truncate">{file}</p>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        <button
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600"
                                                            onClick={() => window.open(fileUrl, '_blank')}
                                                        >
                                                            <LuEye size={20} />
                                                        </button>
                                                        <a
                                                            href={fileUrl}
                                                            download={file}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 flex items-center justify-center"
                                                        >
                                                            <MdOutlineFileDownload size={20} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Comments</h3>

                        {/* Add Comment Input */}
                        <form onSubmit={handleAddComment} className="mb-8">
                            <div className="flex gap-3">
                                {profileData?.profile_picture_url ? (
                                    <img
                                        src={getMediaUrl(profileData.profile_picture_url)}
                                        alt="Me"
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[12px] text-green-700 font-bold flex-shrink-0">
                                        {profileData?.username?.[0]?.toUpperCase() || 'Me'}
                                    </div>
                                )}
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        disabled={postingComment}
                                    />
                                    <button
                                        type="submit"
                                        disabled={postingComment || !newComment.trim()}
                                        className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Comments List */}
                        {loadingComments ? (
                            <div className="text-center py-8 text-gray-400">Loading comments...</div>
                        ) : (
                            <div className="space-y-6">
                                {comments.length > 0 ? (
                                    renderComments(comments)
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                        No comments yet. Be the first to join the conversation!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
                            <MdDelete size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Content?</h3>
                        <p className="text-gray-500 text-center mb-8">
                            This action cannot be undone. All comments and data associated with this content will be permanently removed.
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
                                onClick={handleDelete}
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
    );
};

export default ContentDetailPage;
