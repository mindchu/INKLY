// frontend/src/components/content_detail/CommentThreadPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { IoArrowForward } from "react-icons/io5"; // Removed IoHeart imports
import { api } from '../../util/api';
import { useProfileContext } from '../../context/ProfileContext';
import { getMediaUrl } from '../../config';

// Import reusable components
import LikeButton from '../../components/button/LikeButton';
import DeleteButton from '../../components/button/DeleteButton';

const CommentThreadPage = () => {
    const { contentId, commentId } = useParams();
    const navigate = useNavigate();
    const { profileData } = useProfileContext();
    const [anchorComment, setAnchorComment] = useState(null);
    const [replies, setReplies] = useState([]);
    const [contentTitle, setContentTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const lastFetchedId = React.useRef(null);

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [postingReply, setPostingReply] = useState(false);

    useEffect(() => {
        const fetchThread = async () => {
            if (lastFetchedId.current === commentId) return;
            lastFetchedId.current = commentId;
            setLoading(true);
            try {
                const response = await api.get(`/content/${contentId}/comment/${commentId}`);
                setAnchorComment(response.data);
                setReplies(response.replies || []);
                setContentTitle(response.content_title || '');
            } catch (error) {
                console.error('Failed to fetch comment thread:', error);
                lastFetchedId.current = null;
            } finally {
                setLoading(false);
            }
        };
        fetchThread();
    }, [contentId, commentId]);

    const handleReply = async (parentId) => {
        if (!replyText.trim()) return;

        setPostingReply(true);
        try {
            const response = await api.post(`/content/${contentId}/comment`, {
                text: replyText,
                parent_id: parentId
            });
            if (response.success) {
                const refreshed = await api.get(`/content/${contentId}/comment/${commentId}`);
                setAnchorComment(refreshed.data);
                setReplies(refreshed.replies || []);
                setReplyText('');
                setReplyingTo(null);
            }
        } catch (error) {
            console.error('Failed to post reply:', error);
        } finally {
            setPostingReply(false);
        }
    };

    // --- Helper functions to deeply update/delete nested comments ---
    const updateCommentInTree = (commentsList, targetId, updateFn) => {
        return commentsList.map(comment => {
            if (comment._id === targetId) {
                return updateFn(comment);
            }
            if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: updateCommentInTree(comment.replies, targetId, updateFn) };
            }
            return comment;
        });
    };

    const deleteCommentFromTree = (commentsList, targetId) => {
        return commentsList
            .filter(comment => comment._id !== targetId)
            .map(comment => {
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: deleteCommentFromTree(comment.replies, targetId) };
                }
                return comment;
            });
    };

    // --- Handlers for passing into our reusable buttons ---
    const handleLikeSuccess = (id, isLiked) => {
        const updateFn = (c) => ({
            ...c,
            is_liked: isLiked,
            like_count: isLiked ? (c.like_count || 0) + 1 : Math.max(0, (c.like_count || 1) - 1)
        });

        // Update anchor comment if it's the target
        if (anchorComment && anchorComment._id === id) {
            setAnchorComment(prev => updateFn(prev));
            return;
        }

        // Otherwise search the replies tree
        setReplies(prevReplies => updateCommentInTree(prevReplies, id, updateFn));
    };

    const handleDeleteSuccess = (id) => {
        setReplyingTo(null); // Clear reply box just in case the deleted comment was being replied to

        // If they delete the main thread anchor, kick them back to the content page
        if (anchorComment && anchorComment._id === id) {
            navigate(`/content/${contentId}`);
            return;
        }

        // Otherwise slice it out of the nested replies tree
        setReplies(prevReplies => deleteCommentFromTree(prevReplies, id));
    };


    const renderComments = (commentList, level = 0) => {
        return commentList.map((comment) => (
                <div key={comment._id} className={`mt-4 ${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
                <div className="flex items-start gap-2">
                    {comment.author_profile_picture_url ? (
                        <img
                            src={getMediaUrl(comment.author_profile_picture_url)}
                            alt={comment.author_username}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold">
                            {comment.author_username?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{comment.author_username || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400">recent</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 break-all">{comment.text}</p>

                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                className="text-xs text-green-600 font-medium hover:underline"
                            >
                                {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                            </button>

                            <LikeButton 
                                targetId={comment._id}
                                initialIsLiked={comment.is_liked}
                                initialLikesCount={comment.like_count || 0}
                                endpointUrl={`/comment/${comment._id}/like`}
                                onLikeSuccess={handleLikeSuccess}
                            />

                            {profileData && (profileData.google_id === comment.author_id || profileData.is_admin) && (
                                <DeleteButton 
                                    targetId={comment._id}
                                    itemName="Comment"
                                    // This logic ensures admins use the admin route and users use the regular one
                                    endpointUrl={
                                        profileData.is_admin 
                                            ? `/admin/content/${contentId}/comment/${comment._id}` 
                                            : `/comment/${comment._id}`
                                    }
                                    onDeleteSuccess={(id) => {
                                        setComments(prev => prev.filter(c => c._id !== id));
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
                {level < 2 ? (
                    comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)
                ) : (
                    comment.replies && comment.replies.length > 0 && (
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

    if (loading) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading thread...</div>
            </div>
        );
    }

    if (!anchorComment) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <div className='text-lg font-medium text-gray-600'>Comment not found</div>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Link to Content Detail */}
                <Link
                    to={`/content/${contentId}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-700 mb-6 transition-colors font-medium w-fit"
                >
                    <MdArrowBack size={20} />
                    <span>Back to full content</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4">
                            {contentTitle || 'Discussion Thread'}
                        </h2>

                        {/* Anchor Comment */}
                        <div className="mb-8">
                            <div className="flex items-start gap-3">
                                {anchorComment.author_profile_picture_url ? (
                                    <img
                                        src={getMediaUrl(anchorComment.author_profile_picture_url)}
                                        alt={anchorComment.author_username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-semibold">
                                        {anchorComment.author_username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">{anchorComment.author_username || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-400">original comment</span>
                                    </div>
                                    <p className="text-lg text-gray-800 mt-2 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 break-all">
                                        {anchorComment.text}
                                    </p>

                                    <div className="flex items-center gap-4 mt-3">
                                        <button
                                            onClick={() => setReplyingTo(replyingTo === anchorComment._id ? null : anchorComment._id)}
                                            className="text-sm text-green-600 font-semibold hover:underline"
                                        >
                                            {replyingTo === anchorComment._id ? 'Cancel' : 'Reply to this thread'}
                                        </button>

                                        <LikeButton 
                                            targetId={anchorComment._id}
                                            initialIsLiked={anchorComment.is_liked}
                                            initialLikesCount={anchorComment.like_count || 0}
                                            endpointUrl={`/comment/${anchorComment._id}/like`}
                                            onLikeSuccess={handleLikeSuccess}
                                        />

                                        {profileData && (profileData.google_id === anchorComment.author_id || profileData.is_admin) && (
                                            <DeleteButton 
                                                targetId={anchorComment._id}
                                                itemName="Comment"
                                                endpointUrl={
                                                    profileData.is_admin 
                                                        ? `/admin/content/${contentId}/comment/${anchorComment._id}` 
                                                        : `/comment/${anchorComment._id}`
                                                }
                                                onDeleteSuccess={() => {
                                                    navigate(`/content/${contentId}`, { replace: true });
                                                }}
                                            />
                                        )}
                                    </div>

                                    {replyingTo === anchorComment._id && (
                                        <div className="mt-4 flex gap-2">
                                            <input
                                                type="text"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder={`Reply to the thread...`}
                                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleReply(anchorComment._id)}
                                                disabled={postingReply || !replyText.trim()}
                                                className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Replies</h3>
                            <div className="space-y-2">
                                {replies.length > 0 ? (
                                    renderComments(replies)
                                ) : (
                                    <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No replies in this thread yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentThreadPage;