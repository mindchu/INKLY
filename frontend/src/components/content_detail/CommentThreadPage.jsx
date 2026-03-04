import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { IoHeartOutline, IoHeart, IoArrowForward } from "react-icons/io5";
import { api } from '../../util/api';
import FollowChip from '../common/FollowChip';

const CommentThreadPage = () => {
    const { contentId, commentId } = useParams();
    const navigate = useNavigate();
    const [anchorComment, setAnchorComment] = useState(null);
    const [replies, setReplies] = useState([]);
    const [contentTitle, setContentTitle] = useState('');
    const [loading, setLoading] = useState(true);

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [postingReply, setPostingReply] = useState(false);

    useEffect(() => {
        const fetchThread = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/content/${contentId}/comment/${commentId}`);
                setAnchorComment(response.data);
                setReplies(response.replies || []);
                setContentTitle(response.content_title || '');
            } catch (error) {
                console.error('Failed to fetch comment thread:', error);
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

    const renderComments = (commentList, level = 0) => {
        return commentList.map((comment) => (
            <div key={comment._id} className={`mt-4 ${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
                <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-700 font-bold">
                        {comment.author_username?.[0]?.toUpperCase() || 'U'}
                    </div>
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
                {/* Notice: We don't limit depth here, or we could limit it further if needed, 
                    but the user asked to limit to 5 per level. In a thread view, 
                    we usually show more or just allow infinite recursion for that subtree.
                    I'll keep infinite recursion here as it's a dedicated thread view. */}
                {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
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
                                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-semibold">
                                    {anchorComment.author_username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">{anchorComment.author_username || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-400">original comment</span>
                                    </div>
                                    <p className="text-lg text-gray-800 mt-2 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {anchorComment.text}
                                    </p>

                                    <div className="flex items-center gap-4 mt-3">
                                        <button
                                            onClick={() => setReplyingTo(replyingTo === anchorComment._id ? null : anchorComment._id)}
                                            className="text-sm text-green-600 font-semibold hover:underline"
                                        >
                                            {replyingTo === anchorComment._id ? 'Cancel' : 'Reply to this thread'}
                                        </button>
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
