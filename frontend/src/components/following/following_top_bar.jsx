import React from 'react'
import { RiSearch2Line } from "react-icons/ri";
import { GoPeople } from "react-icons/go";

import { useProfileContext } from '../../context/ProfileContext';

const Follow_top_bar = () => {
    const { profileData } = useProfileContext();

    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row mt-1.5 gap-3 items-center ml-5 justify-between w-full pr-8'>
                <div className='flex flex-row items-center gap-3'>
                    <GoPeople size={32} className='opacity-70' />
                    <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>FOLLOWING</p>
                </div>
                {profileData && (
                    <div className='text-[#3E4A34] font-["Inter"] text-[16px]'>
                        Welcome, {profileData.is_admin ? 'Admin' : 'User'}:{profileData.username}
                    </div>
                )}
            </div>
            <div className='ml-5 mr-5 mt-1.5 flex flex-row gap-3 w- items-center border-2 rounded-2xl p-1.5 pl-4 mb-5'>
                <button className='cursor-pointer'>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input type='text' placeholder='Search discussions by title, subject, or tags...' className='select-none flex flex-1 items-center bg-transparent font-["Inter"] text-[18px] outline-none border-none focus:outline-none focus:ring-0'></input>
            </div>

        </div>
    )
}

export default Follow_top_bar