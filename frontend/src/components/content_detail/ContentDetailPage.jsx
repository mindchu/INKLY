// frontend/src/components/content_detail/ContentDetailPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload, MdArrowBack, MdDelete, MdEdit } from 'react-icons/md';
import { LuEye } from 'react-icons/lu';
import { IoHeartOutline, IoHeart, IoArrowForward } from "react-icons/io5";
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';
import { useProfileContext } from '../../context/ProfileContext';
import { getMediaUrl } from '../../config';
import DeleteButton from '../../components/button/DeleteButton';

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

const deleteCommentFromTree = (commentsList, commentId) => {
    return commentsList
        .filter(c => c._id !== commentId)
        .map(c => ({
            ...c,
            replies: c.replies ? deleteCommentFromTree(c.replies, commentId) : []
        }));
};

const toggleCommentLikeInTree = (commentsList, commentId, isLiked) => {
    return commentsList.map(c => {
        if (c._id === commentId) {
            return {
                ...c,
                is_liked: isLiked,
                like_count: isLiked ? (c.like_count || 0) + 1 : Math.max(0, (c.like_count || 1) - 1)
            };
        }
        if (c.replies?.length > 0) {
            return { ...c, replies: toggleCommentLikeInTree(c.replies, commentId, isLiked) };
        }
        return c;
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
    const location = useLocation();

    const [content, setContent] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [postingComment, setPostingComment] = useState(false);
    const [postingReply, setPostingReply] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [notificationMessage, setNotificationMessage] = useState("");
    const lastFetchedId = useRef(null);
    const MAX_COMMENT_LENGTH = 1000;

    useEffect(() => {
        const fetchContent = async () => {
            if (lastFetchedId.current === contentId) return;
            lastFetchedId.current = contentId;
            setLoading(true);
            try {
                const response = await api.get(`/content/${contentId}`);
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
        if (newComment.length > MAX_COMMENT_LENGTH) {
            setNotificationMessage(`Comment is too long. Maximum ${MAX_COMMENT_LENGTH} characters allowed.`);
            setTimeout(() => setNotificationMessage(""), 5000);
            return;
        }
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
        if (replyText.length > MAX_COMMENT_LENGTH) {
            setNotificationMessage(`Comment is too long. Maximum ${MAX_COMMENT_LENGTH} characters allowed.`);
            setTimeout(() => setNotificationMessage(""), 5000);
            return;
        }
        if (!replyText.trim()) return;
        setPostingReply(true);
        try {
            const response = await api.post(`/content/${contentId}/comment`, {
                text: replyText,
                parent_id: parentId
            });
            if (response.success) {
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

    const handleLikeComment = async (commentId) => {
        try {
            const response = await api.post(`/comment/${commentId}/like`);
            if (response.success) {
                setComments(prev => toggleCommentLikeInTree(prev, commentId, response.is_liked));
            }
        } catch (error) {
            console.error('Failed to toggle comment like:', error);
        }
    };

    const renderComments = (commentList, level = 0) => {
        return commentList.map((comment) => (
            <div key={comment._id} className={`mt-4 ${level > 0 ? 'ml-6 border-l-2 border-gray-100 pl-3' : ''}`}>
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
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{comment.author_username || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400">recent</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 break-words">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                className="text-xs text-green-600 font-medium hover:underline"
                            >
                                {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                            </button>
                            <button
                                onClick={() => handleLikeComment(comment._id)}
                                className={`flex items-center gap-1 text-xs font-medium hover:text-red-500 transition-colors ${comment.is_liked ? 'text-red-500' : 'text-gray-500'}`}
                            >
                                {comment.is_liked ? <IoHeart size={14} /> : <IoHeartOutline size={14} />}
                                <span>{comment.like_count || 0}</span>
                            </button>
                            {profileData && (profileData.google_id === comment.author_id || profileData.is_admin) && (
                                <DeleteButton
                                    targetId={comment._id}
                                    itemName="Comment"
                                    endpointUrl={
                                        profileData.is_admin
                                            ? `/admin/content/${contentId}/comment/${comment._id}`
                                            : `/comment/${comment._id}`
                                    }
                                    onDeleteSuccess={(id) => {
                                        setComments(prev => deleteCommentFromTree(prev, id));
                                    }}
                                />
                            )}
                        </div>
                        {replyingTo === comment._id && (
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Reply to ${comment.author_username || 'user'}...`}
                                    className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleReply(comment._id)}
                                    disabled={postingReply || !replyText.trim() || replyText.length > MAX_COMMENT_LENGTH}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex-shrink-0"
                                >
                                    Reply
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {level < 2 ? (
                    comment.replies?.length > 0 && renderComments(comment.replies, level + 1)
                ) : (
                    comment.replies?.length > 0 && (
                        <div className="mt-4 ml-8">
                            <Link
                                to={`/content/${contentId}/comment/${comment._id}`}
                                state={location.state}
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

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">

                {/* Back Button */}
                <button
                    onClick={() => {
                        if (location.state?.from) navigate(location.state.from);
                        else if (content.type === 'discussion') navigate('/discussion');
                        else navigate('/note_forum');
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-700 mb-4 md:mb-6 transition-colors font-medium"
                >
                    <MdArrowBack size={20} />
                    <span>Back</span>
                </button>

                {notificationMessage && (
                    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                        {notificationMessage}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    {/* ── Header ── */}
                    <div className="p-5 md:p-8 border-b border-gray-100">

                        {/* Tags */}
                        {content.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {content.tags.map((tag, index) => (
                                    <span key={index} className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 break-words">
                            {content.title}
                        </h1>

                        {/* Author row — full width, no icons beside it */}
                        <div className="flex items-center gap-3 mb-4">
                            {content.author_profile_picture_url ? (
                                <img
                                    src={getMediaUrl(content.author_profile_picture_url)}
                                    alt={content.author_username}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-base md:text-lg font-semibold flex-shrink-0">
                                    {content.author_username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap text-sm md:text-base">
                                    {content.author_username || 'Unknown'}
                                    <FollowChip authorId={content.author_id} initialIsFollowing={content.is_following} />
                                </p>
                                <p className="text-xs md:text-sm text-gray-500">Published recently</p>
                            </div>
                        </div>

                        {/* Action row — edit/delete/like/views on their own row */}
                        <div className="flex items-center gap-4 text-gray-400">
                            {profileData && profileData.google_id === content.author_id && (
                                <>
                                    <button
                                        onClick={() => navigate(`/edit/${contentId}`)}
                                        className="p-1.5 hover:text-blue-500 transition-colors"
                                        title="Edit"
                                    >
                                        <MdEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-1.5 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${content.is_liked ? 'text-red-500' : ''}`}
                            >
                                {content.is_liked ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}
                                <span className="text-sm font-medium">{content.like_count || 0}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                                <LuEye size={20} />
                                <span className="text-sm font-medium">{content.views || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="p-5 md:p-8">
                        <div className="text-gray-700 leading-relaxed text-base md:text-lg mb-8 whitespace-pre-wrap break-words">
                            {content.text}
                        </div>

                        {/* Attachments */}
                        {content.file_paths?.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <GoPaperclip size={20} className="text-gray-600" />
                                    <h3 className="text-base md:text-xl font-bold text-gray-900">
                                        Attachments ({content.file_paths.length})
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {content.file_paths.map((file, index) => {
                                        const fileInfo = getFileIcon(file);
                                        const fileUrl = getMediaUrl(`/uploads/${file}`);
                                        const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(file.split('.').pop().toLowerCase());
                                        return (
                                            <div key={index} className="flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                                {isImage && (
                                                    <div className="w-full bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100">
                                                        <img src={fileUrl} alt={file} className="max-h-[200px] md:max-h-[300px] object-contain rounded-lg" />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between p-3 md:p-4 bg-white">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <div className={`${fileInfo.color} text-white px-2 py-1 rounded-lg font-bold text-xs flex-shrink-0`}>
                                                            {fileInfo.label}
                                                        </div>
                                                        <p className="font-medium text-gray-900 truncate text-sm">{file}</p>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0 ml-2">
                                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition text-blue-600" onClick={() => window.open(fileUrl, '_blank')}>
                                                            <LuEye size={18} />
                                                        </button>
                                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-600" onClick={() => window.open(fileUrl, '_blank')}>
                                                            <MdOutlineFileDownload size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Comments ── */}
                    <div className="p-5 md:p-8 bg-gray-50 border-t border-gray-100">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-5">Comments</h3>

                        {/* Comment input */}
                        <form onSubmit={handleAddComment} className="mb-6 md:mb-8">
                            <div className="flex gap-2 md:gap-3">
                                {profileData?.profile_picture_url ? (
                                    <img
                                        src={getMediaUrl(profileData.profile_picture_url)}
                                        alt="Me"
                                        className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-9 h-9 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center text-[11px] text-green-700 font-bold flex-shrink-0">
                                        {profileData?.username?.[0]?.toUpperCase() || 'Me'}
                                    </div>
                                )}
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setNewComment(value);
                                            if (value.length > MAX_COMMENT_LENGTH) {
                                                setNotificationMessage(`Too long: ${value.length}/${MAX_COMMENT_LENGTH}`);
                                                setTimeout(() => setNotificationMessage(""), 3000);
                                            }
                                        }}
                                        placeholder="Add a comment..."
                                        className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                                        disabled={postingComment}
                                        rows="2"
                                    />
                                    <button
                                        type="submit"
                                        disabled={postingComment || !newComment.trim() || newComment.length > MAX_COMMENT_LENGTH}
                                        className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex-shrink-0"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Comments list */}
                        {loadingComments ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Loading comments...</div>
                        ) : (
                            <div className="space-y-4">
                                {comments.length > 0 ? renderComments(comments) : (
                                    <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                                        No comments yet. Be the first to join the conversation!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-5 mx-auto">
                            <MdDelete size={28} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">Delete Content?</h3>
                        <p className="text-gray-500 text-center mb-6 text-sm md:text-base">
                            This action cannot be undone. All comments and data will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                            >
                                {deleting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentDetailPage;