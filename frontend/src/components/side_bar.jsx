import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LuPencil } from "react-icons/lu";
import { AiOutlineHome } from "react-icons/ai";
import { FiSidebar, FiMenu, FiChevronRight, FiChevronLeft } from "react-icons/fi";
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


// ── Mobile tab bar pages ────────────────────────────────────────────────────
const TAB_PAGE_1 = [
    { label: 'Home',       icon: AiOutlineHome,   path: '/home' },
    { label: 'Discussion', icon: BiChat,           path: '/discussion' },
    { label: 'Search',     icon: RiSearch2Line,    path: '/search' },
    { label: 'Profile',    icon: CgProfile,        path: '/profile' },
]

const TAB_PAGE_2 = [
    { label: 'Notes',     icon: CgNotes,          path: '/note_forum' },
    { label: 'Following', icon: HiOutlineUsers,   path: '/following' },
    { label: 'Bookmark',  icon: CiBookmarkMinus,  path: '/bookmarks' },
    { label: 'Create',    icon: IoCreateOutline,  path: '/create_note' },
]
// ───────────────────────────────────────────────────────────────────────────


const Side_bar = () => {
    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const { profileData, logout } = useProfileContext();
    const navigate = useNavigate();
    const location = useLocation();

    const [tabPage, setTabPage] = useState(1);

    const handleSignOut = async () => {
        await logout();
        navigate('/signin');
    };

    useEffect(() => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    }, [location.pathname, closeSidebar]);

    const menuItems = [
        {
            section: 'Explore', items: [
                { label: 'Home',       icon: <AiOutlineHome size={20} />,   path: '/home' },
                { label: 'Discussion', icon: <BiChat size={20} />,          path: '/discussion' },
                { label: 'Note',       icon: <CgNotes size={20} />,         path: '/note_forum' },
                { label: 'Search',     icon: <RiSearch2Line size={20} />,   path: '/search' },
                { label: 'Following',  icon: <HiOutlineUsers size={20} />,  path: '/following' },
            ]
        },
        {
            section: 'My content', items: [
                { label: 'My Note',           icon: <CgNotes size={20} />,         path: '/my_notes' },
                { label: 'My Discussion',     icon: <BiChat size={20} />,          path: '/my_discussions' },
                { label: 'Create Note',       icon: <IoCreateOutline size={20} />, path: '/create_note' },
                { label: 'Create Discussion', icon: <BiChat size={20} />,          path: '/create_discussion' },
                { label: 'Bookmark',          icon: <CiBookmarkMinus size={20} />, path: '/bookmarks' },
            ]
        },
        {
            section: 'Account', items: [
                { label: 'Profile',   icon: <CgProfile size={20} />,     path: '/profile' },
                { label: 'Interests', icon: <LuPencil size={20} />,      path: '/interests' },
                { label: 'Sign Out',  icon: <PiSignOutBold size={20} />, onClick: handleSignOut },
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
            {/* ── Mobile overlay (when sidebar is forced open on mobile) ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}

            {/* ── Desktop sidebar ─────────────────────────────────────── */}
            <div className={`
                hidden md:flex flex-col
                ${isOpen ? 'translate-x-0 w-[260px]' : 'translate-x-0 w-[80px]'} 
                relative z-50 h-screen bg-white shadow-2xl transition-all duration-300
            `}>
                <div className='flex flex-row items-center justify-between'>
                    <div className='flex flex-row select-none'>
                        <div className={`flex flex-row items-center transition-opacity duration-300 ${!isOpen && 'hidden'}`}>
                            <LuPencil size={20} className='mt-[34px] ml-[24px]' />
                            <img src='/src/assets/image.png' className='w-[64px] h-[32px] mt-[30px] ml-[16px]' alt="Inkly" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-[26px] mr-[16px]">
                        <button onClick={toggleSidebar} className='cursor-pointer hover:bg-[#E8FFDF] rounded-xl p-1'>
                            <FiSidebar size={30} />
                        </button>
                    </div>
                </div>

                <div className={`flex flex-col gap-3 select-none grow mt-8 ${isOpen ? 'overflow-y-auto' : 'overflow-visible items-center'}`}>
                    {/* Profile Section */}
                    <div className={`px-4 mb-4 ${!isOpen && 'px-0'}`}>
                        <div
                            onClick={() => navigate('/profile')}
                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors ${!isOpen && 'justify-center'}`}
                        >
                            {profileData?.profile_picture_url ? (
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-100 flex-shrink-0"
                                    style={{ backgroundImage: `url("${getMediaUrl(profileData.profile_picture_url)}")` }}
                                />
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
                                <div className="h-4" />
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
                                                    ${!isOpen ? 'justify-center' : 'gap-[20px] px-4'}
                                                `}
                                            >
                                                <div className={`${!isOpen ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</div>
                                                {isOpen && <p className="font-['Inter'] text-[16px] font-medium">{item.label}</p>}
                                            </button>
                                            {!isOpen && (
                                                <div className='absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2.5 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]'>
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

            {/* ── Mobile bottom tab bar ───────────────────────────────── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <div className="flex items-stretch h-[60px]">
                    {tabPage === 1 ? (
                        <>
                            {TAB_PAGE_1.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = location.pathname === tab.path;
                                return (
                                    <button
                                        key={tab.path}
                                        onClick={() => navigate(tab.path)}
                                        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 relative transition-colors duration-150 ${
                                            isActive ? 'text-[#3E4A34]' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {isActive && (
                                            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#3E4A34] rounded-full" />
                                        )}
                                        <span className={`p-1.5 rounded-xl transition-colors duration-150 ${isActive ? 'bg-[#EEF2E1]' : ''}`}>
                                            <Icon size={20} />
                                        </span>
                                        <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setTabPage(2)}
                                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="p-1.5 rounded-xl">
                                    <FiChevronRight size={20} />
                                </span>
                                <span className="text-[10px] font-medium leading-none">More</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setTabPage(1)}
                                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="p-1.5 rounded-xl">
                                    <FiChevronLeft size={20} />
                                </span>
                                <span className="text-[10px] font-medium leading-none">Back</span>
                            </button>
                            {TAB_PAGE_2.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = location.pathname === tab.path;
                                return (
                                    <button
                                        key={tab.path}
                                        onClick={() => navigate(tab.path)}
                                        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 relative transition-colors duration-150 ${
                                            isActive ? 'text-[#3E4A34]' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {isActive && (
                                            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#3E4A34] rounded-full" />
                                        )}
                                        <span className={`p-1.5 rounded-xl transition-colors duration-150 ${isActive ? 'bg-[#EEF2E1]' : ''}`}>
                                            <Icon size={20} />
                                        </span>
                                        <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default Side_bar