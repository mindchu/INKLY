import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import FollowButton from './FollowButton';

const Feed = ({ title, type = 'all', user }) => {
    const [posts, setPosts] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const [liking, setLiking] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tag = queryParams.get('tag');
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags([tag]);
            // Clear the query param from URL without reloading
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate, selectedTags]);

    useEffect(() => {
        const fetchFeed = async () => {
            if (!user) return;
            setFeedLoading(true);
            try {
                let url = `${API_BASE_URL}/content/recommended`;
                const params = new URLSearchParams();

                if (type !== 'all') {
                    params.append('type', type);
                }

                if (selectedTags.length > 0) {
                    selectedTags.forEach(tag => params.append('tags', tag));
                }

                const queryString = params.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }

                const response = await fetch(url, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch feed", error);
            } finally {
                setFeedLoading(false);
            }
        };

        fetchFeed();
    }, [user, selectedTags, type]);

    const handleLike = async (e, postId) => {
        e.stopPropagation();
        if (liking[postId]) return;

        setLiking(prev => ({ ...prev, [postId]: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/content/${postId}/like`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                setPosts(prevPosts => prevPosts.map(post => {
                    if (post._id === postId) {
                        const isLiked = result.is_liked;
                        const currentLikes = post.liked_by_user_ids || [];
                        let newLikedBy;
                        if (isLiked) {
                            newLikedBy = [...currentLikes, user.google_id];
                        } else {
                            newLikedBy = currentLikes.filter(id => id !== user.google_id);
                        }
                        return { ...post, liked_by_user_ids: newLikedBy };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error("Failed to toggle like", error);
        } finally {
            setLiking(prev => ({ ...prev, [postId]: false }));
        }
    };

    if (!user) return null;

    return (
        <div className="home-container">
            <Sidebar user={user} />

            <main className="main-feed">
                <header className="feed-header">
                    <h2>{title}</h2>
                </header>

                <div className="feed-content">
                    {feedLoading ? (
                        <div className="loading-feed">Loading feed...</div>
                    ) : posts.length > 0 ? (
                        <div className="posts-list">
                            {posts.map(post => (
                                <article
                                    key={post._id}
                                    className="post-card"
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    <div className="post-card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className="post-author">{post.author_username || 'Unknown'}</span>
                                            <FollowButton authorId={post.author_id} currentUser={user} />
                                        </div>
                                        <span className="post-date">• {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent'}</span>
                                    </div>
                                    <h3 className="post-card-title">{post.title}</h3>
                                    <p className="post-card-snippet">
                                        {(post.text || '').length > 150 ? `${post.text.substring(0, 150)}...` : post.text}
                                    </p>
                                    <div className="post-card-footer">
                                        <div className="post-card-tags">
                                            {(post.tags || []).slice(0, 3).map(tag => (
                                                <span key={tag} className="post-tag">#{tag}</span>
                                            ))}
                                        </div>
                                        <div className="post-card-metrics">
                                            <button
                                                className={`metric-btn ${post.liked_by_user_ids?.includes(user.google_id) ? 'active' : ''}`}
                                                onClick={(e) => handleLike(e, post._id)}
                                                disabled={liking[post._id]}
                                            >
                                                <span className="metric-icon">❤️</span>
                                                {post.liked_by_user_ids?.length || 0}
                                            </button>
                                            <div className="metric-item">
                                                <span className="metric-icon">💬</span>
                                                {post.comment_ids?.length || 0}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-feed">
                            <h3>Welcome to your feed, {user.username}!</h3>
                            <p>Follow interests to see more content or create your first post.</p>
                            <button onClick={() => navigate('/create')} className="btn-primary">
                                Create First Post
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <RightPanel selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        </div>
    );
};

export default Feed;
