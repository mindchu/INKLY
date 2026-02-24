import React, { useState } from 'react'
import { RiUserUnfollowLine, RiUserAddLine } from 'react-icons/ri'
import { FaUserCircle } from 'react-icons/fa'

const Following_page = () => {
    // Sample data - replace with your actual data
    const followedBlogs = Array(10).fill({
        name: "Student 1",
        updatedTime: "updated 2 hours ago"
    }).map((blog, index) => ({
        ...blog,
        id: index
    }));

    // State for popup notification
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [followedUsers, setFollowedUsers] = useState(new Set());

    // Handle follow/unfollow button click
    const handleFollowToggle = (id, name) => {
        const isFollowing = followedUsers.has(id);
        
        if (isFollowing) {
            // Unfollow
            setFollowedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            setNotificationMessage(`You have unfollowed ${name}`);
        } else {
            // Follow
            setFollowedUsers(prev => new Set(prev).add(id));
            setNotificationMessage(`You are now following ${name}`);
        }
        
        setShowNotification(true);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto px-8 py-6'>
            {/* Notification Popup - Fixed to viewport */}
            {showNotification && (
                <div className='fixed top-8 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg px-6 py-4 flex items-center gap-3 z-50 animate-slide-down border border-green-200'>
                    <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                        <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                    </div>
                    <p className='text-gray-800 font-medium'>
                        {notificationMessage}
                    </p>
                </div>
            )}

            {/* Header with Dynamic Count */}
            <h2 className='text-[#5A6B52] text-lg font-normal mb-6'>
                Blogs You follow({followedUsers.size})
            </h2>
            
            {/* Blog List Card */}
            <div className='bg-white rounded-2xl shadow-sm'>
                {followedBlogs.map((blog, index) => (
                    <div 
                        key={index}
                        className='flex items-center justify-between px-8 py-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors'
                    >
                        <div className='flex items-center gap-4'>
                            {/* User Icon */}
                            <FaUserCircle className='w-11 h-11 text-[#5A7F4E]' />
                            
                            {/* Blog Info */}
                            <div>
                                <p className='text-gray-800 font-medium text-base'>{blog.name}</p>
                                <p className='text-gray-500 text-sm'>{blog.updatedTime}</p>
                            </div>
                        </div>

                        {/* Follow/Unfollow Button */}
                        <button 
                            onClick={() => handleFollowToggle(blog.id, blog.name)}
                            className='transition-colors'
                        >
                            {followedUsers.has(blog.id) ? (
                                <RiUserUnfollowLine className='w-7 h-7 text-red-500 hover:text-red-600' />
                            ) : (
                                <RiUserAddLine className='w-7 h-7 text-green-500 hover:text-green-600' />
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Add this CSS for animation */}
            <style jsx>{`
                @keyframes slide-down {
                    from {
                        top: -100px;
                        opacity: 0;
                    }
                    to {
                        top: 2rem;
                        opacity: 1;
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    )
}

export default Following_page