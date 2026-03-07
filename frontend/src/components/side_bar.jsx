import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LuPencil } from "react-icons/lu";
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { FiSidebar, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { BiChat, BiSolidChat } from "react-icons/bi";
import { RiSearch2Line, RiSearch2Fill } from "react-icons/ri";
import { HiOutlineUsers, HiUsers } from "react-icons/hi2";
import { CgNotes } from "react-icons/cg";
import { IoCreateOutline, IoCreate, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { CiBookmarkMinus } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { MdPerson, MdPersonOutline, MdAdminPanelSettings, MdInterests } from "react-icons/md";
import { PiSignOutBold, PiNotepadBold, PiNotepadLight } from "react-icons/pi";
import { useSidebar } from '../context/SidebarContext';
import { useProfileContext } from '../context/ProfileContext';
import { getMediaUrl } from '../config';
import { FaUserCircle } from 'react-icons/fa';


// ── Mobile tab pages ────────────────────────────────────────────────────────
// Page 0: no arrows (full width 4 tabs)
// Pages 1–3: back + 4 tabs + next (where applicable)
const TAB_PAGES = [
    [
        { label: 'Home',       iconOff: AiOutlineHome,    iconOn: AiFillHome,         path: '/home' },
        { label: 'Discussion', iconOff: BiChat,            iconOn: BiSolidChat,         path: '/discussion' },
        { label: 'Search',     iconOff: RiSearch2Line,     iconOn: RiSearch2Fill,       path: '/search' },
        { label: 'Profile',    iconOff: MdPersonOutline,   iconOn: MdPerson,            path: '/profile' },
    ],
    [
        { label: 'Notes',     iconOff: PiNotepadLight,    iconOn: PiNotepadBold,       path: '/note_forum' },
        { label: 'Following', iconOff: HiOutlineUsers,    iconOn: HiUsers,             path: '/following' },
        { label: 'Bookmark',  iconOff: IoBookmarkOutline, iconOn: IoBookmark,          path: '/bookmarks' },
        { label: 'Create',    iconOff: IoCreateOutline,   iconOn: IoCreate,            path: '/create_note' },
    ],
    [
        { label: 'My Notes',  iconOff: CgNotes,           iconOn: CgNotes,             path: '/my_notes' },
        { label: 'My Disc.',  iconOff: BiChat,             iconOn: BiSolidChat,         path: '/my_discussions' },
        { label: 'Interests', iconOff: MdInterests,        iconOn: MdInterests,         path: '/interests' },
        { label: 'Sign Out',  iconOff: PiSignOutBold,      iconOn: PiSignOutBold,       path: null, isSignOut: true },
    ],
    [
        { label: 'Admin',     iconOff: MdAdminPanelSettings, iconOn: MdAdminPanelSettings, path: '/admin', isAdmin: true },
    ],
]
// ───────────────────────────────────────────────────────────────────────────


const Side_bar = () => {
    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const { profileData, logout } = useProfileContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [tabPage, setTabPage] = useState(0);

    const handleSignOut = async () => {
        await logout();
        navigate('/signin');
    };

    useEffect(() => {
        if (window.innerWidth < 768) closeSidebar();
    }, [location.pathname, closeSidebar]);

    // Auto-jump to correct tab page based on active route
    useEffect(() => {
        TAB_PAGES.forEach((page, pageIdx) => {
            if (page.some(tab => tab.path && tab.path === location.pathname)) {
                setTabPage(pageIdx);
            }
        });
    }, [location.pathname]);

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
                { label: 'My Note',           icon: <CgNotes size={20} />,          path: '/my_notes' },
                { label: 'My Discussion',     icon: <BiChat size={20} />,           path: '/my_discussions' },
                { label: 'Create Note',       icon: <IoCreateOutline size={20} />,  path: '/create_note' },
                { label: 'Create Discussion', icon: <BiChat size={20} />,           path: '/create_discussion' },
                { label: 'Bookmark',          icon: <CiBookmarkMinus size={20} />,  path: '/bookmarks' },
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

    // Only show admin tab page if user is admin
    const visibleTabPages = profileData?.is_admin ? TAB_PAGES : TAB_PAGES.slice(0, 3);
    const totalPages = visibleTabPages.length;
    const currentTabs = visibleTabPages[tabPage] || visibleTabPages[0];

    // Is this the first page? → no arrows, full width
    const isFirstPage = tabPage === 0;
    const isLastPage  = tabPage === totalPages - 1;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* ── Desktop sidebar ─────────────────────────────────── */}
            <div className={`
                hidden md:flex flex-col flex-shrink-0
                ${isOpen ? 'w-[260px]' : 'w-[80px]'}
                relative z-50 h-screen bg-white shadow-2xl transition-all duration-300
            `}>
                <div className='flex flex-row items-center justify-between'>
                    <div className={`flex flex-row items-center transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 ml-6' : 'opacity-0 w-0 ml-0'}`}>
                        <LuPencil size={20} className='mt-[34px]' />
                        <img src='/src/assets/image.png' className='w-[64px] h-[32px] mt-[30px] ml-[16px]' alt="Inkly" />
                    </div>
                    <div className="flex items-center mt-[26px] mr-[16px]">
                        <button onClick={toggleSidebar} className='cursor-pointer hover:bg-[#E8FFDF] rounded-xl p-1'>
                            <FiSidebar size={30} />
                        </button>
                    </div>
                </div>

                <div className={`flex flex-col gap-3 select-none grow mt-8 ${isOpen ? 'overflow-y-auto' : 'overflow-visible items-center'}`}>
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
                            {isOpen && (
                                <p className="font-['Kalam'] text-[16px] ml-[24px] mb-2 text-gray-500">{section.section}</p>
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

            {/* ── Mobile bottom tab bar ───────────────────────────── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">

                {/* Page indicator dots */}
                <div className="flex justify-center items-center gap-1.5 py-1.5 bg-white/95 backdrop-blur-sm">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setTabPage(i)}
                            className={`rounded-full transition-all duration-300 ${
                                tabPage === i
                                    ? 'w-5 h-1.5 bg-[#3E4A34]'
                                    : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>

                {/* Tab row */}
                <div className="bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                    <div className={`flex items-stretch h-[62px] ${isFirstPage ? '' : 'px-2'}`}>

                        {/* ← Back — hidden on page 0 */}
                        {!isFirstPage && (
                            <button
                                onClick={() => setTabPage(p => Math.max(0, p - 1))}
                                className="flex flex-col items-center justify-center w-10 py-2 text-gray-400 hover:text-[#3E4A34] transition-colors"
                            >
                                <FiChevronLeft size={18} />
                            </button>
                        )}

                        {/* Tabs — stretch full width on page 0, share space on others */}
                        <div className="flex flex-1 items-stretch">
                            {currentTabs.map((tab) => {
                                const isActive = location.pathname === tab.path;
                                const IconOff = tab.iconOff;
                                const IconOn  = tab.iconOn;
                                return (
                                    <button
                                        key={tab.label}
                                        onClick={() => {
                                            if (tab.isSignOut) { handleSignOut(); return; }
                                            navigate(tab.path);
                                        }}
                                        className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 relative transition-all duration-200 ${
                                            tab.isSignOut
                                                ? 'text-red-400 hover:text-red-600'
                                                : tab.isAdmin
                                                    ? isActive ? 'text-amber-700' : 'text-amber-500 hover:text-amber-600'
                                                    : isActive
                                                        ? 'text-[#3E4A34]'
                                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {/* Active pill */}
                                        {isActive && !tab.isSignOut && (
                                            <span className="absolute inset-x-2 top-1 bottom-1 bg-[#EEF2E1] rounded-xl -z-0" />
                                        )}

                                        <span className="relative z-10">
                                            {isActive && !tab.isSignOut
                                                ? <IconOn size={22} />
                                                : <IconOff size={22} />
                                            }
                                        </span>
                                        <span className={`relative z-10 text-[10px] leading-none tracking-tight ${
                                            isActive && !tab.isSignOut ? 'font-bold' : 'font-medium'
                                        }`}>
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* → Next — hidden on last page */}
                        {!isLastPage && (
                            <button
                                onClick={() => setTabPage(p => Math.min(totalPages - 1, p + 1))}
                                className="flex flex-col items-center justify-center w-10 py-2 text-gray-400 hover:text-[#3E4A34] transition-colors"
                            >
                                <FiChevronRight size={18} />
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </>
    )
}

export default Side_bar