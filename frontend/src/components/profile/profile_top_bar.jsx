import React from 'react'
import { TiUserOutline } from "react-icons/ti";
import { useNavigate, useLocation } from 'react-router-dom';

const Profile_top_bar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isEditPage = location.pathname === '/edit_profile';

    const handleSave = () => {
        if (window.handleProfileSave) {
            window.handleProfileSave();
        } else {
            navigate('/profile');
        }
    };

    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row items-center justify-between mt-2 px-4 md:px-0 md:ml-5 md:pr-8'>

                {/* Title */}
                <div className='flex flex-row items-center gap-2 md:gap-3'>
                    <TiUserOutline size={24} className='opacity-70 md:hidden' />
                    <TiUserOutline size={32} className='opacity-70 hidden md:block' />
                    <p className='font-["Julius_Sans_One"] text-[22px] md:text-[32px] text-[#3E4A34] font-thin select-none'>
                        {isEditPage ? 'EDIT PROFILE' : 'PROFILE'}
                    </p>
                </div>

                {/* Buttons */}
                <div className='flex gap-2 md:gap-6 items-center'>
                    {isEditPage ? (
                        <>
                            <button
                                onClick={() => navigate('/profile')}
                                className='h-[36px] md:h-[40px] px-3 md:w-[150px] rounded-md border border-[#838181] opacity-60 font-["Inter"] text-[13px] md:text-[16px] cursor-pointer hover:bg-gray-100 hover:opacity-100 hover:border-[#5a5a5a] transition-all duration-200'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className='h-[36px] md:h-[40px] px-3 md:w-[150px] rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-[13px] md:text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'
                            >
                                Save
                                <span className='hidden md:inline'> changes</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/edit_profile')}
                            className='h-[36px] md:h-[40px] px-4 md:w-[150px] rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-[13px] md:text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'
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