import React from 'react'
import { RiSearch2Line } from "react-icons/ri";
import { BiChat } from "react-icons/bi";
import { MdOutlineDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { BiSortAZ, BiSortZA } from "react-icons/bi";
import { useMyNotesContext } from '../../context/MyNotesContext';
import { useProfileContext } from '../../context/ProfileContext';

const My_discussions_top_bar = () => {
    const { searchQuery, setSearchQuery, sortBy, setSortBy } = useMyNotesContext();
    const { profileData } = useProfileContext();

    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row mt-1.5 gap-3 items-center ml-5 justify-between w-full pr-8'>
                <div className='flex flex-row items-center gap-3'>
                    <BiChat size={32} className='opacity-70 text-[#3E4A34]' />
                    <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>MY DISCUSSIONS</p>
                </div>
                {profileData && (
                    <div className='text-[#3E4A34] font-["Inter"] text-[16px]'>
                        Welcome, {profileData.is_admin ? 'Admin' : 'User'}:{profileData.username}
                    </div>
                )}
            </div>
            <div className='ml-5 mr-5 mt-1.5 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4 '>
                <button className='cursor-pointer'>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search discussions by title, text, or tags...'
                    className='select-none flex flex-1 items-center bg-transparent font-["Inter"] text-[18px] outline-none border-none focus:outline-none focus:ring-0'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className='ml-8 mt-3 flex flex-row items-center gap-3'>
                <p className='text-[#577F4E] font-["Inter"] text-[16px] select-none'>
                    Sorted by:
                </p>
                <div className='flex flex-row gap-2'>
                    <button
                        onClick={() => setSortBy('date_created')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'date_created'
                            ? 'bg-[#8B7355] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <MdOutlineDateRange size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>Date</span>
                    </button>
                    <button
                        onClick={() => setSortBy('most_recent')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'most_recent'
                            ? 'bg-[#6B9BD1] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <IoTimeOutline size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>Recent</span>
                    </button>
                    <button
                        onClick={() => setSortBy('title_az')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'title_az'
                            ? 'bg-[#7CAA6D] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <BiSortAZ size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>A-Z</span>
                    </button>
                    <button
                        onClick={() => setSortBy('title_za')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'title_za'
                            ? 'bg-[#C97064] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <BiSortZA size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>Z-A</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default My_discussions_top_bar
