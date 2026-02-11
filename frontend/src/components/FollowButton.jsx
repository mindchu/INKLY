import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const FollowButton = ({ authorId, currentUser }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Don't show button for own content
    if (!currentUser || !authorId || currentUser.google_id === authorId) {
        return null;
    }

    // Check if already following
    useEffect(() => {
        if (currentUser.following_ids) {
            setIsFollowing(currentUser.following_ids.includes(authorId));
        }
    }, [currentUser, authorId]);

    const handleFollow = async (e) => {
        e.stopPropagation(); // Prevent triggering parent click events
        if (loading) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users/${authorId}/follow`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                setIsFollowing(result.is_following);

                // Update current user's following list in parent component
                // This could be improved with a global state management solution
                if (result.is_following) {
                    currentUser.following_ids = [...(currentUser.following_ids || []), authorId];
                } else {
                    currentUser.following_ids = (currentUser.following_ids || []).filter(id => id !== authorId);
                }
            }
        } catch (error) {
            console.error("Failed to toggle follow", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
            disabled={loading}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;
