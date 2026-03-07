import React, { useState } from 'react';
import { FaShare } from "react-icons/fa";
import { toast } from 'react-toastify';

const ShareButton = ({ 
    targetId, 
    title = "Check out this content", 
    text = "I found this interesting and wanted to share it with you",
    iconSize = 16 
}) => {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async (e) => {
        e.stopPropagation();
        
        const shareUrl = `${window.location.origin}/content/${targetId}`;
        const shareData = {
            title: title,
            text: text,
            url: shareUrl
        };

        setIsSharing(true);

        try {
            if (navigator.share && navigator.canShare) {
                await navigator.share(shareData);
                toast.success('Content shared successfully!');
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied to clipboard!');
                } catch (clipboardError) {
                    console.error('Failed to share or copy:', clipboardError);
                    toast.error('Failed to share content');
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <button
            onClick={handleShare}
            className='cursor-pointer flex flex-row items-center gap-[6px] hover:text-green-600 transition-colors'
            disabled={isSharing}
            title="Share"
        >
            {isSharing ? (
                <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
            ) : (
                <FaShare size={iconSize} className='text-[#292D32] group-hover:text-green-600' />
            )}
        </button>
    );
};

export default ShareButton;