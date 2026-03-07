import React, { useState } from 'react'
import { RiSearch2Line } from "react-icons/ri";
import { LuNotepadText } from "react-icons/lu";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline, IoClose } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { FiMenu } from "react-icons/fi";
import { useMyNotesContext } from '../../context/MyNotesContext';
import { useSidebar } from '../../context/SidebarContext';

const My_notes_top_bar = () => {
    const { localSearch, setLocalSearch, fetchSearch, sortBy, setSortBy, includeTags, setIncludeTags, excludeTags, setExcludeTags } = useMyNotesContext();
    const { toggleSidebar } = useSidebar();

    const [includeInput, setIncludeInput] = useState('');
    const [excludeInput, setExcludeInput] = useState('');

    const handleSearchSubmit = () => fetchSearch(localSearch);
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearchSubmit(); };

    const handleIncludeKeyDown = (e) => {
        if (e.key === 'Enter' && includeInput.trim()) {
            const tag = includeInput.trim();
            if (!includeTags.includes(tag)) setIncludeTags(prev => [...prev, tag]);
            setIncludeInput('');
        }
    };

    const handleExcludeKeyDown = (e) => {
        if (e.key === 'Enter' && excludeInput.trim()) {
            const tag = excludeInput.trim();
            if (!excludeTags.includes(tag)) setExcludeTags(prev => [...prev, tag]);
            setExcludeInput('');
        }
    };

    const removeIncludeTag = (tag) => setIncludeTags(prev => prev.filter(t => t !== tag));
    const removeExcludeTag = (tag) => setExcludeTags(prev => prev.filter(t => t !== tag));

    const sortButtons = [
        { value: 'views', label: 'Views', icon: <MdOutlineRemoveRedEye size={16} /> },
        { value: 'comments', label: 'Comments', icon: <BiCommentDetail size={16} /> },
        { value: 'likes', label: 'Likes', icon: <IoHeartOutline size={16} /> },
        { value: 'date', label: 'Date', icon: <MdOutlineDateRange size={16} /> },
    ];

    return (
        <div className='w-full bg-white shadow-md py-3'>
            {/* Header */}
            <div className='flex flex-row mt-1.5 gap-3 items-center mx-4 sm:mx-5 justify-between'>
                <div className='flex flex-row items-center gap-3'>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
                        <FiMenu size={24} className="text-[#3E4A34]" />
                    </button>
                    <LuNotepadText size={28} className='opacity-70 hidden sm:block' />
                    <p className='font-["Julius_Sans_One"] text-[24px] sm:text-[32px] text-[#3E4A34] font-thin select-none'>MY NOTES</p>
                </div>
            </div>

            {/* Search */}
            <div className='mx-4 sm:mx-5 mt-1.5 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4'>
                <button className='cursor-pointer flex-shrink-0' onClick={handleSearchSubmit}>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search notes by title, subject, or tags...'
                    className='flex flex-1 min-w-0 bg-transparent font-["Inter"] text-[15px] sm:text-[18px] outline-none border-none focus:outline-none focus:ring-0 select-none'
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Sort By */}
            <div className='mt-2 mx-4 sm:mx-5 flex flex-row items-center gap-2 sm:gap-3 flex-wrap'>
                <p className='text-[#124C09] font-["Inter"] text-[15px] sm:text-[18px] select-none'>Sort by:</p>
                <div className='flex flex-row gap-2 flex-wrap'>
                    {sortButtons.map(({ value, label, icon }) => (
                        <button
                            key={value}
                            onClick={() => setSortBy(value)}
                            className={`flex flex-row items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full transition-all text-sm ${
                                sortBy === value
                                    ? 'bg-[#3E4A34] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {icon}
                            <span className='font-["Inter"] text-[13px] sm:text-[14px] font-medium'>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter By */}
            <div className='mt-3 mx-4 sm:mx-5 flex flex-col sm:flex-row sm:items-start gap-3 pb-2 flex-wrap'>
                <p className='text-[#124C09] font-["Inter"] text-[15px] sm:text-[18px] select-none flex-shrink-0 sm:pt-1'>Filter by:</p>

                <div className='flex flex-col sm:flex-row gap-3 flex-1 min-w-0'>
                    {/* Include tags */}
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Include:</span>
                        {includeTags.map(tag => (
                            <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[12px] px-3 py-1 rounded-full font-medium whitespace-nowrap'>
                                #{tag}
                                <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900'><IoClose size={13} /></button>
                            </span>
                        ))}
                        <input
                            type='text'
                            value={includeInput}
                            onChange={e => setIncludeInput(e.target.value)}
                            onKeyDown={handleIncludeKeyDown}
                            placeholder='Tag + Enter'
                            className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-28 sm:w-36'
                        />
                    </div>

                    <div className='hidden sm:block w-px bg-gray-200 self-stretch' />
                    <div className='block sm:hidden w-full h-px bg-gray-200' />

                    {/* Exclude tags */}
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Exclude:</span>
                        {excludeTags.map(tag => (
                            <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[12px] px-3 py-1 rounded-full font-medium whitespace-nowrap'>
                                #{tag}
                                <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-800'><IoClose size={13} /></button>
                            </span>
                        ))}
                        <input
                            type='text'
                            value={excludeInput}
                            onChange={e => setExcludeInput(e.target.value)}
                            onKeyDown={handleExcludeKeyDown}
                            placeholder='Tag + Enter'
                            className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-28 sm:w-36'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default My_notes_top_bar