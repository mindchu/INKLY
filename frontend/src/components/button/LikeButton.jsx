import React, { useState } from 'react';
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { api } from '../../util/api'; // Adjust this path based on where you save this file

const LikeButton = ({ 
    targetId, 
    initialIsLiked = false, 
    initialLikesCount = 0, 
    endpointUrl, 
    onLikeSuccess 
}) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    const handleLike = async (e) => {
        e.stopPropagation();
        
        // Optimistic UI update: change immediately for a snappy feel
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            // Defaults to your content endpoint, but can be overridden for comments
            const url = endpointUrl || `/content/${targetId}/like`;
            const response = await api.post(url);
            
            if (response.success) {
                // Sync exactly with what the server returns
                setIsLiked(response.is_liked);
                setLikesCount(response.like_count || (newIsLiked ? likesCount + 1 : likesCount - 1));
                
                // If the parent component needs to know (e.g., updating total stats)
                if (onLikeSuccess) onLikeSuccess(targetId, response.is_liked);
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
            // Revert on failure
            setIsLiked(!newIsLiked);
            setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    return (
        <button
            onClick={handleLike}
            className='flex items-center gap-1 hover:text-red-500 transition cursor-pointer'
        >
            {isLiked ? (
                <IoHeart size={16} className='text-red-500' />
            ) : (
                <IoHeartOutline size={16} />
            )}
            <span className={isLiked ? 'text-red-500' : 'text-gray-600'}>
                {likesCount}
            </span>
        </button>
    );
};

export default LikeButton;