import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LuPencil } from "react-icons/lu";
import { AiOutlineHome } from "react-icons/ai";
import { FiSidebar, FiMenu, FiX } from "react-icons/fi";
import { BiChat } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";
import { HiOutlineUsers } from "react-icons/hi2";
import { CgNotes } from "react-icons/cg";
import { IoCreateOutline } from "react-icons/io5";
import { CiBookmarkMinus } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { PiSignOutBold } from "react-icons/pi";
import { MdAdminPanelSettings } from "react-icons/md";
import { useSidebar } from '../context/SidebarContext';
import { useProfileContext } from '../context/ProfileContext';
import { getMediaUrl } from '../config';
import { FaUserCircle } from 'react-icons/fa';


const Side_bar = () => {
    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const { profileData, logout } = useProfileContext();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await logout();
        navigate('/signin');
    };

    // Close sidebar automatically on mobile when navigating
    useEffect(() => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    }, [location.pathname, closeSidebar]);

    const menuItems = [
        {
            section: 'Explore', items: [
                { label: 'Home', icon: <AiOutlineHome size={20} />, path: '/home' },
                { label: 'Discussion', icon: <BiChat size={20} />, path: '/discussion' },
                { label: 'Note', icon: <CgNotes size={20} />, path: '/note_forum' },
                { label: 'Search', icon: <RiSearch2Line size={20} />, path: '/search' },
                { label: 'Following', icon: <HiOutlineUsers size={20} />, path: '/following' },
            ]
        },
        {
            section: 'My content', items: [
                { label: 'My Note', icon: <CgNotes size={20} />, path: '/my_notes' },
                { label: 'My Discussion', icon: <BiChat size={20} />, path: '/my_discussions' },
                { label: 'Create Note', icon: <IoCreateOutline size={20} />, path: '/create_note' },
                { label: 'Create Discussion', icon: <BiChat size={20} />, path: '/create_discussion' },
                { label: 'Bookmark', icon: <CiBookmarkMinus size={20} />, path: '/bookmarks' },
            ]
        },
        {
            section: 'Account', items: [
                { label: 'Profile', icon: <CgProfile size={20} />, path: '/profile' },
                { label: 'Interests', icon: <LuPencil size={20} />, path: '/interests' },
                { label: 'Sign Out', icon: <PiSignOutBold size={20} />, onClick: handleSignOut },
            ]
        },
    ];

    if (profileData?.is_admin) {
        menuItems.push({
            section: 'Admin', items: [
                { label: 'Admin Terminal', icon: <MdAdminPanelSettings size={20} />, path: '/admin' }
            ]
        });
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}

            <div className={`
                ${isOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px] md:translate-x-0 md:w-[80px]'} 
                fixed md:relative z-50 h-screen bg-white shadow-2xl flex flex-col transition-all duration-300
            `}>
                <div className='flex flex-row items-center justify-between'>
                    <div className='flex flex-row select-none'>
                        {(isOpen || window.innerWidth >= 768) && (
                            <div className={`flex flex-row items-center transition-opacity duration-300 ${!isOpen && 'md:hidden'}`}>
                                <LuPencil size={20} className='mt-[34px] ml-[24px]' />
                                <img src='/src/assets/image.png' className='w-[64px] h-[32px] mt-[30px] ml-[16px]' alt="Inkly" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-[26px] mr-[16px]">
                        <button onClick={toggleSidebar} className='cursor-pointer hover:bg-[#E8FFDF] rounded-xl p-1'>
                            {isOpen ? <FiSidebar size={30} /> : <FiMenu size={30} className="md:hidden" />}
                            {!isOpen && <FiSidebar size={30} className="hidden md:block" />}
                        </button>
                    </div>
                </div>

                <div className={`flex flex-col gap-3 select-none grow mt-8 ${isOpen ? 'overflow-y-auto' : 'overflow-visible md:items-center'}`}>
                    {/* Profile Section in Sidebar */}
                    <div className={`px-4 mb-4 ${!isOpen && 'md:px-0'}`}>
                        <div
                            onClick={() => navigate('/profile')}
                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors ${!isOpen && 'md:justify-center'}`}
                        >
                        {profileData?.profile_picture_url ? (
                            <div
                                className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-100 flex-shrink-0"
                                style={{ backgroundImage: `url("${getMediaUrl(profileData.profile_picture_url)}")` }}
                            ></div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <FaUserCircle size={24} className="text-green-600 opacity-70" />
                            </div>
                        )}
                            {isOpen && (
                                <div className="overflow-hidden">
                                    <p className="font-['Inter'] text-sm font-semibold text-gray-800 truncate">{profileData?.username || 'User'}</p>
                                    <p className="font-['Inter'] text-xs text-gray-500 truncate">View Profile</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {menuItems.map((section, idx) => (
                        <div key={idx} className='w-full'>
                            {isOpen ? (
                                <p className="font-['Kalam'] text-[16px] ml-[24px] mb-2 text-gray-500">{section.section}</p>
                            ) : (
                                <div className="h-4 md:hidden" />
                            )}
                            <div className='flex flex-col gap-1'>
                                {section.items.map((item, itemIdx) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <div key={itemIdx} className="relative group w-full px-2">
                                            <button
                                                onClick={item.onClick || (() => navigate(item.path))}
                                                className={`
                                                    flex flex-row items-center w-full h-[40px] rounded-xl transition-all duration-200 
                                                    ${isActive ? 'bg-[#E8FFDF] text-[#124C09]' : 'hover:bg-gray-100 text-gray-700'}
                                                    ${!isOpen ? 'md:justify-center' : 'gap-[20px] px-4'}
                                                `}
                                            >
                                                <div className={`${!isOpen ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</div>
                                                {isOpen && <p className="font-['Inter'] text-[16px] font-medium">{item.label}</p>}
                                            </button>

                                            {!isOpen && (
                                                <div className='hidden md:block absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2.5 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]'>
                                                    {item.label}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="h-4" />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Side_bar
