import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import CommentItem from '../components/CommentItem';
import FollowButton from '../components/FollowButton';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [liking, setLiking] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user
                const userRes = await fetch(`${API_BASE_URL}/users/me`, { credentials: 'include' });
                if (userRes.ok) {
                    setUser(await userRes.json());
                } else {
                    navigate('/login');
                    return;
                }

                // Fetch post and comments
                const postRes = await fetch(`${API_BASE_URL}/content/${id}`, { credentials: 'include' });
                if (postRes.ok) {
                    const data = await postRes.json();
                    setPost(data.data);
                    setComments(Array.isArray(data.comments) ? data.comments : []);
                } else {
                    setError("Post not found");
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError("An error occurred while loading the post");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/content/${id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: commentText }),
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                setComments([...comments, { ...result.data, replies: [] }]);
                setCommentText('');
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (liking) return;

        setLiking(true);
        try {
            const response = await fetch(`${API_BASE_URL}/content/${id}/like`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                const isLiked = result.is_liked;
                const currentLikes = post.liked_by_user_ids || [];
                let newLikedBy;
                if (isLiked) {
                    newLikedBy = [...currentLikes, user.google_id];
                } else {
                    newLikedBy = currentLikes.filter(uid => uid !== user.google_id);
                }
                setPost({ ...post, liked_by_user_ids: newLikedBy });
            }
        } catch (error) {
            console.error("Failed to toggle like", error);
        } finally {
            setLiking(false);
        }
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!post) return null;

    return (
        <div className="home-container">
            <Sidebar user={user} />

            <div className="main-feed">
                <div className="post-detail-main">
                    <div className="post-content-area">
                        <div className="post-meta-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Posted by {post.author_username || 'Unknown'}
                                <FollowButton authorId={post.author_id} currentUser={user} />
                            </div>
                            <span>• {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <h1 className="post-title">{post.title}</h1>
                        <div className="post-text">{post.text}</div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="post-tags">
                                {post.tags.map(tag => (
                                    <span key={tag} className="post-tag">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {post.file_paths && post.file_paths.length > 0 && (
                            <div className="post-documents">
                                <h3>Documents</h3>
                                <div className="documents-grid">
                                    {post.file_paths.map((filename, index) => {
                                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
                                        const fileUrl = `${API_BASE_URL}/uploads/${filename}`;

                                        return (
                                            <div key={index} className="document-item">
                                                {isImage ? (
                                                    <div
                                                        className="document-preview image-preview"
                                                        onClick={() => setEnlargedImage(fileUrl)}
                                                    >
                                                        <img src={fileUrl} alt={`Attachment ${index + 1}`} />
                                                    </div>
                                                ) : (
                                                    <div className="document-preview generic-preview">
                                                        <span className="file-icon">📄</span>
                                                    </div>
                                                )}
                                                <div className="document-info">
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="download-link"
                                                    >
                                                        Download {isImage ? 'Image' : 'File'}
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="post-detail-metrics">
                            <button
                                className={`metric-btn-large ${post.liked_by_user_ids?.includes(user?.google_id) ? 'active' : ''}`}
                                onClick={handleLike}
                                disabled={liking}
                            >
                                <span className="metric-icon">❤️</span>
                                {post.liked_by_user_ids?.length || 0} Likes
                            </button>
                            <div className="metric-item-large">
                                <span className="metric-icon">💬</span>
                                {comments?.length || 0} Comments
                            </div>
                        </div>
                    </div>

                    <div className="comment-section-box">
                        <h2>Comments</h2>

                        <div className="comment-input-area">
                            <textarea
                                className="comment-textarea"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="What are your thoughts?"
                            />
                            <button
                                className="comment-submit-btn"
                                onClick={handlePostComment}
                                disabled={submitting || !commentText.trim()}
                            >
                                {submitting ? 'Posting...' : 'Comment'}
                            </button>
                        </div>

                        {comments && comments.length > 0 ? (
                            <div className="comments-list">
                                {comments.map((comment) => (
                                    <CommentItem
                                        key={comment._id}
                                        comment={comment}
                                        postId={id}
                                        user={user}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </div>
            </div>

            <RightPanel />

            {enlargedImage && (
                <div className="image-modal-overlay" onClick={() => setEnlargedImage(null)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={enlargedImage} alt="Enlarged" />
                        <button className="modal-close-btn" onClick={() => setEnlargedImage(null)}>&times;</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetail;
