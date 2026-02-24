import React from 'react'
import { TiUserOutline } from "react-icons/ti";
import { useNavigate, useLocation } from 'react-router-dom';

const Profile_top_bar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we're on edit profile page
    const isEditPage = location.pathname === '/edit_profile';

    const handleSave = () => {
        // Call the save function from Edit_profile_page
        if (window.handleProfileSave) {
            window.handleProfileSave();
        } else {
            // Fallback: just navigate back
            navigate('/profile');
        }
    };

    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row gap-3 items-center mt-2'>
                <TiUserOutline size={32} className='opacity-70 ml-5' />
                <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>
                    {isEditPage ? 'EDIT PROFILE' : 'PROFILE'}
                </p>
                <div className='flex gap-6 ml-auto mr-5'>
                    {isEditPage ? (
                        // Edit profile buttons
                        <>
                            <button 
                                onClick={() => navigate('/profile')} 
                                className='w-[150px] h-[40px] rounded-md border border-[#838181] opacity-60 font-["Inter"] text-[16px] cursor-pointer hover:bg-gray-100 hover:opacity-100 hover:border-[#5a5a5a] transition-all duration-200'
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className='w-[150px] h-[40px] rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'
                            >
                                Save changes
                            </button>
                        </>
                    ) : (
                        // Profile page button
                        <button 
                            onClick={() => navigate('/edit_profile')} 
                            className='w-[150px] h-[40px] rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'
                        >
                            Edit profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile_top_bar