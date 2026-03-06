import React, { useState, useEffect } from 'react'
import { RiUserUnfollowLine, RiUserAddLine } from 'react-icons/ri'
import { FaUserCircle } from 'react-icons/fa'
import { api } from '../../util/api'
import { useProfileContext } from '../../context/ProfileContext'
import { useSearch } from '../../context/SearchContext'

const Following_page = () => {
    const { profileData } = useProfileContext();
    const { query } = useSearch();
    const [followedUsers, setFollowedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const lastFetchedId = React.useRef(null);

    useEffect(() => {
        const fetchFollowing = async () => {
            const currentId = profileData?.google_id;
            if (currentId) {
                if (lastFetchedId.current === currentId) return;
                lastFetchedId.current = currentId;
                setLoading(true);
                try {
                    const data = await api.get(`/users/${currentId}/following`);
                    setFollowedUsers(data.data || []);
                } catch (error) {
                    console.error('Failed to fetch following:', error);
                    lastFetchedId.current = null;
                } finally {
                    setLoading(false);
                }
            } else {
                setFollowedUsers([]);
                lastFetchedId.current = null;
                setLoading(false);
            }
        };
        fetchFollowing();
    }, [profileData]);

    const handleFollowToggle = async (targetId, name) => {
        try {
            const response = await api.post(`/users/${targetId}/follow`);
            if (response.success) {
                if (response.is_following) {
                    setNotificationMessage(`You are now following ${name}`);
                    // Technically we shouldn't be following someone already in this list unless the UI allows "discovery" here
                } else {
                    setNotificationMessage(`You have unfollowed ${name}`);
                    setFollowedUsers(prev => prev.filter(u => u.google_id !== targetId));
                }
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        }
    };

    if (loading) {
        return (
            <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
                <p className='font-[Inter] text-xl animate-pulse text-gray-600'>Loading your circle...</p>
            </div>
        );
    }

    const filteredUsers = followedUsers.filter(user =>
        user.username.toLowerCase().includes((query || '').toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes((query || '').toLowerCase()))
    );

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto px-8 py-6'>
            {showNotification && (
                <div className='fixed top-8 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg px-6 py-4 flex items-center gap-3 z-50 border border-green-200'>
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

            <h2 className='text-[#5A6B52] text-lg font-semibold mb-6'>
                People You Followed ({filteredUsers.length})
            </h2>

            <div className='bg-white rounded-2xl shadow-sm'>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                        <div
                            key={user.google_id || index}
                            className='flex items-center justify-between px-8 py-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors'
                        >
                            <div className='flex items-center gap-4'>
                                {user.profile_picture_url ? (
                                    <div
                                        className="w-11 h-11 rounded-full bg-cover bg-center border border-gray-200"
                                        style={{ backgroundImage: `url(${user.profile_picture_url})` }}
                                    />
                                ) : (
                                    <FaUserCircle className='w-11 h-11 text-[#5A7F4E]' />
                                )}

                                <div>
                                    <p className='text-gray-800 font-semibold text-base'>{user.username}</p>
                                    <p className='text-gray-500 text-sm truncate max-w-[200px]'>{user.bio || 'Active content creator'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleFollowToggle(user.google_id, user.username)}
                                className='transition-colors'
                                title="Unfollow"
                            >
                                <RiUserUnfollowLine className='w-7 h-7 text-red-500 hover:text-red-600 cursor-pointer' />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className='py-20 text-center text-gray-500 font-medium'>
                        {query ? "No one matches your search." : "You aren't following anyone yet. Explore the feed to find creators!"}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Following_page
