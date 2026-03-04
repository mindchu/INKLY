import React from 'react';
import { useProfileContext } from '../../context/ProfileContext';

const AdminMockChip = () => {
    const { profileData, toggleAdmin } = useProfileContext();

    // If we haven't loaded profile data yet (or it's null), don't show the chip.
    // We can also just show it anytime for demo, but let's wait for profileData to be safe.
    if (!profileData) return null;

    return (
        <div
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full cursor-pointer shadow-lg font-bold text-sm transition-colors ${profileData.is_admin
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
            onClick={toggleAdmin}
            title="Click to toggle Admin Role (Demo Purpose)"
        >
            Role: {profileData.is_admin ? 'Admin' : 'User'}
        </div>
    );
};

export default AdminMockChip;
