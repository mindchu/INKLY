import React, { useState, useEffect } from 'react';
import { api } from '../../util/api';
import { useProfileContext } from '../../context/ProfileContext';

const FollowChip = ({ authorId, initialIsFollowing, className = '', onFollowChange }) => {
    const { profileData } = useProfileContext();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);
    if (!authorId || (profileData && profileData.google_id === authorId)) {
        return null; 
    }

    const handleFollowToggle = async (e) => {
        e.stopPropagation();
        if (loading) return;

        setLoading(true);
        try {
            const response = await api.post(`/users/${authorId}/follow`);
            
            if (response.success) {
                setIsFollowing(response.is_following);
                if (onFollowChange) {
                    onFollowChange(authorId, response.is_following);
                }
            }
        } catch (error) {
            console.error('Failed to toggle follow status:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`transition-colors font-["Inter"] font-semibold text-[11px] px-[8px] py-[2px] rounded-full border ${isFollowing
                    ? 'bg-[#E8FFDF] border-[#C3D9BA] text-[#577F4E] hover:bg-[#FCE8E8] hover:text-[#C0392B] hover:border-[#F5C6C6] group'
                    : 'bg-white border-[#577F4E] text-[#577F4E] hover:bg-[#577F4E] hover:text-white'
                } ${className}`}
        >
            {isFollowing ? (
                <span className="group-hover:hidden">Following</span>
            ) : (
                <span>Follow</span>
            )}
            {isFollowing && (
                <span className="hidden group-hover:block">Unfollow</span>
            )}
        </button>
    );
};

export default FollowChip;
