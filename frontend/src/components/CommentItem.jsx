import { useState } from 'react';
import API_BASE_URL from '../config';
import FollowButton from './FollowButton';

const CommentItem = ({ comment, postId, user, depth = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [liking, setLiking] = useState(false);
    const [replies, setReplies] = useState(comment.replies || []);
    const [likesCount, setLikesCount] = useState(Array.isArray(comment.liked_by_user_ids) ? comment.liked_by_user_ids.length : 0);
    const [isLiked, setIsLiked] = useState(Array.isArray(comment.liked_by_user_ids) && user?.google_id ? comment.liked_by_user_ids.includes(user.google_id) : false);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/content/${comment._id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: replyText }),
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                setReplies([...replies, { ...result.data, replies: [] }]);
                setReplyText('');
                setIsReplying(false);
            }
        } catch (error) {
            console.error("Failed to post reply", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (liking) return;

        setLiking(true);
        try {
            const response = await fetch(`${API_BASE_URL}/content/${comment._id}/like`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                setIsLiked(result.is_liked);
                setLikesCount(prev => result.is_liked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            console.error("Failed to toggle like", error);
        } finally {
            setLiking(false);
        }
    };

    return (
        <div className="comment-item" style={{ marginLeft: depth > 0 ? '0' : '0' }}>
            <div className="comment-container">
                <div className="thread-line-container">
                    <div className="thread-line"></div>
                </div>
                <div className="comment-content">
                    <div className="comment-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="comment-author">{comment.author_username || 'Unknown'}</span>
                            <FollowButton authorId={comment.author_id} currentUser={user} />
                        </div>
                        <span className="comment-date">{comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Recent'}</span>
                    </div>
                    <div className="comment-text">
                        {comment.text}
                    </div>
                    <div className="comment-actions">
                        <button
                            className={`comment-action-btn ${isLiked ? 'active' : ''}`}
                            onClick={handleLike}
                            disabled={liking}
                        >
                            ❤️ {likesCount}
                        </button>
                        <button
                            className="comment-action-btn"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            Reply
                        </button>
                    </div>

                    {isReplying && (
                        <div className="comment-input-area" style={{ marginTop: '1rem' }}>
                            <textarea
                                className="comment-textarea"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="What are your thoughts?"
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="comment-submit-btn"
                                    onClick={handleReply}
                                    disabled={submitting || !replyText.trim()}
                                >
                                    {submitting ? 'Posting...' : 'Reply'}
                                </button>
                                <button
                                    className="comment-action-btn"
                                    onClick={() => setIsReplying(false)}
                                    style={{ marginTop: '8px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {replies.length > 0 && (
                        <div className="replies-container">
                            {replies.map((reply) => (
                                <CommentItem
                                    key={reply._id}
                                    comment={reply}
                                    postId={postId}
                                    user={user}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
