import React, { useState } from 'react'
import { BiMessageSquare } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline, IoClose } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { FiMenu, FiFilter } from "react-icons/fi";
import { useSortContext } from '../../context/SortContext';
import { useSidebar } from '../../context/SidebarContext';

const Note_forum_top_bar = () => {
    const { sortBy, setSortBy, localSearch, setLocalSearch, fetchSearch, includeTags, setIncludeTags, excludeTags, setExcludeTags } = useSortContext();
    const { toggleSidebar } = useSidebar();

    const [includeInput, setIncludeInput] = useState('');
    const [excludeInput, setExcludeInput] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

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

    const activeFilterCount = includeTags.length + excludeTags.length;

    return (
        <div className='w-full bg-white shadow-md py-3'>
            {/* Header */}
            <div className='flex flex-row mt-1.5 gap-3 items-center ml-4 sm:ml-5 justify-between w-full pr-4 sm:pr-8'>
                <div className='flex flex-row items-center gap-2 sm:gap-3'>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg flex-shrink-0">
                        <FiMenu size={24} className="text-[#3E4A34]" />
                    </button>
                    <BiMessageSquare size={28} className='opacity-70 flex-shrink-0 sm:w-8 sm:h-8' />
                    <p className='font-["Julius Sans One"] text-[22px] sm:text-[28px] md:text-[32px] text-[#3E4A34] font-thin select-none whitespace-nowrap'>NOTE FORUM</p>
                </div>
            </div>

            {/* Search */}
            <div className='mx-4 sm:mx-5 mt-2 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-3 sm:pl-4'>
                <button className='cursor-pointer flex-shrink-0' onClick={handleSearchSubmit}>
                    <RiSearch2Line size={20} className='flex opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search by title, subject, or tags...'
                    className='select-none flex flex-1 items-center bg-transparent font-["Inter"] text-[14px] sm:text-[16px] md:text-[18px] outline-none border-none focus:outline-none focus:ring-0 min-w-0'
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Sort By + Filter toggle (mobile) */}
            <div className='mt-2 mx-4 sm:mx-5 flex flex-row items-center justify-between gap-2'>
                {/* Sort options — scrollable on mobile */}
                <div className='flex flex-row items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-1'>
                    <p className='text-[#124C09] font-["Inter"] text-[14px] sm:text-[16px] md:text-[18px] select-none whitespace-nowrap flex-shrink-0'>Sort by:</p>
                    <div className='flex flex-row gap-1.5 flex-shrink-0'>
                        {[
                            { key: 'views', icon: <MdOutlineRemoveRedEye size={14} />, label: 'Views' },
                            { key: 'comments', icon: <BiCommentDetail size={14} />, label: 'Comments' },
                            { key: 'likes', icon: <IoHeartOutline size={14} />, label: 'Likes' },
                            { key: 'date', icon: <MdOutlineDateRange size={14} />, label: 'Date' },
                        ].map(({ key, icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`flex flex-row items-center gap-1 px-2.5 sm:px-4 py-1.5 rounded-full transition-all whitespace-nowrap text-[12px] sm:text-[14px] font-medium font-["Inter"] ${
                                    sortBy === key ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {icon}
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter toggle button (mobile) */}
                <button
                    onClick={() => setFilterOpen(prev => !prev)}
                    className={`sm:hidden flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-medium font-["Inter"] transition-all border ${
                        filterOpen || activeFilterCount > 0
                            ? 'bg-[#3E4A34] text-white border-[#3E4A34]'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                >
                    <FiFilter size={13} />
                    <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
                </button>
            </div>

            {/* Filter By — always visible on sm+, collapsible on mobile */}
            <div className={`mt-2 mx-4 sm:mx-5 pb-1 pr-4 sm:pr-8 ${filterOpen ? 'flex' : 'hidden sm:flex'} flex-col sm:flex-row sm:items-start gap-3 flex-wrap`}>
                <p className='text-[#124C09] font-["Inter"] text-[14px] sm:text-[16px] md:text-[18px] select-none flex-shrink-0 mt-0.5'>Filter by:</p>

                {/* Include tags */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap'>
                    <span className='text-gray-500 font-["Inter"] text-[12px] sm:text-[13px] select-none flex-shrink-0'>Include:</span>
                    <div className='flex flex-row flex-wrap gap-1.5 items-center'>
                        {includeTags.map(tag => (
                            <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[11px] sm:text-[12px] px-2.5 py-1 rounded-full font-medium'>
                                #{tag}
                                <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900'><IoClose size={12} /></button>
                            </span>
                        ))}
                        <input
                            type='text'
                            value={includeInput}
                            onChange={e => setIncludeInput(e.target.value)}
                            onKeyDown={handleIncludeKeyDown}
                            placeholder='Tag + Enter'
                            className='text-[12px] sm:text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-28 sm:w-36'
                        />
                    </div>
                </div>

                <div className='hidden sm:block w-px bg-gray-200 self-stretch' />
                <div className='block sm:hidden h-px bg-gray-200 w-full' />

                {/* Exclude tags */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap'>
                    <span className='text-gray-500 font-["Inter"] text-[12px] sm:text-[13px] select-none flex-shrink-0'>Exclude:</span>
                    <div className='flex flex-row flex-wrap gap-1.5 items-center'>
                        {excludeTags.map(tag => (
                            <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[11px] sm:text-[12px] px-2.5 py-1 rounded-full font-medium'>
                                #{tag}
                                <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-800'><IoClose size={12} /></button>
                            </span>
                        ))}
                        <input
                            type='text'
                            value={excludeInput}
                            onChange={e => setExcludeInput(e.target.value)}
                            onKeyDown={handleExcludeKeyDown}
                            placeholder='Tag + Enter'
                            className='text-[12px] sm:text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-28 sm:w-36'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Note_forum_top_bar