import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuPencil } from "react-icons/lu";
import { AiOutlineHome } from "react-icons/ai";
import { FiSidebar } from "react-icons/fi";
import { BiChat } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";
import { HiOutlineUsers } from "react-icons/hi2";
import { CgNotes } from "react-icons/cg";
import { IoCreateOutline } from "react-icons/io5";
import { CiBookmarkMinus } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { PiSignOutBold } from "react-icons/pi";

const Side_bar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const menuItems = [
        {
            section: 'Explore', items: [
                { label: 'Home', icon: <AiOutlineHome size={20} />, path: '/home' },
                { label: 'Discussion', icon: <BiChat size={20} />, path: '/discussion' },
                { label: 'Note Forum', icon: <BiChat size={20} />, path: '/note_forum' },
                { label: 'Search', icon: <RiSearch2Line size={20} />, path: '/search' },
                { label: 'Following', icon: <HiOutlineUsers size={20} />, path: '/following' },
            ]
        },
        {
            section: 'My content', items: [
                { label: 'My Notes', icon: <CgNotes size={20} />, path: '/my_notes' },
                { label: 'Create Note', icon: <IoCreateOutline size={20} />, path: '/create_note' },
                { label: 'Bookmarks', icon: <CiBookmarkMinus size={20} />, path: '/bookmarks' },
            ]
        },
        {
            section: 'Account', items: [
                { label: 'Profile', icon: <CgProfile size={20} />, path: '/profile' },
                { label: 'Sign Out', icon: <PiSignOutBold size={20} />, path: '/signin' },
            ]
        },
    ];

    return (
        <div className={`${isOpen ? 'w-[260px]' : 'w-[80px]'} h-screen bg-white shadow-2xl flex flex-col transition-all duration-300`}>
            <div className='flex flex-row items-center justify-between'>
                <div className='flex flex-row select-none'>
                    {isOpen && <LuPencil size={20} className='mt-[34px] ml-[24px]' />}
                    {isOpen && <img src='\src\assets\image.png' className='w-[64px] h-[32px] mt-[30px] ml-[16px]' />}
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className='mt-[26px] mr-[16px] cursor-pointer hover:bg-[#E8FFDF] rounded-xl'>
                    <FiSidebar size={36} />
                </button>
            </div>

            {isOpen ? (
                <div className='flex flex-col gap-3 overflow-y-auto select-none'>
                    {menuItems.map((section, idx) => (
                        <div key={idx} className=''>
                            <p className="font-['Kalam'] text-[16px] mt-[28px] ml-[24px]">{section.section}</p>
                            <div className='gap-2'>
                                {section.items.map((item, itemIdx) => (
                                    <button key={itemIdx} onClick={() => navigate(item.path)} className='flex flex-row items-center gap-[24px] mt-[18px] hover:bg-[#E8FFDF] w-full h-[34px] rounded-2xl transition-all duration-200 '>
                                        <div className='ml-[44px] opacity-45'>{item.icon}</div>
                                        <p className="font-['Inter'] text-[18px]">{item.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex flex-col gap-3 items-center mt-6'>
                    {menuItems.map((section) =>
                        section.items.map((item, idx) => (
                            <div key={idx} className='relative group'>
                                <button onClick={() => navigate(item.path)} className='hover:bg-[#E8FFDF] p-2 rounded-lg transition-all duration-200'>
                                    <div className='opacity-60'>{item.icon}</div>
                                </button>
                                <div className='absolute left-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2.5 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                                    {item.label}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default Side_bar
