import React, { useState } from 'react'
import { BiMessageSquare } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline, IoClose } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { FiMenu } from "react-icons/fi";
import { useSortContext } from '../../context/SortContext';
import { useSidebar } from '../../context/SidebarContext';

const Note_forum_top_bar = () => {
    const { sortBy, setSortBy, localSearch, setLocalSearch, fetchSearch, includeTags, setIncludeTags, excludeTags, setExcludeTags } = useSortContext();
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

    return (
        <div className='w-full bg-white shadow-md py-3'>
            {/* Header */}
            <div className='flex flex-row mt-1.5 gap-3 items-center ml-5 justify-between w-full pr-8'>
                <div className='flex flex-row items-center gap-3'>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
                        <FiMenu size={24} className="text-[#3E4A34]" />
                    </button>
                    <BiMessageSquare size={32} className='opacity-70' />
                    <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>NOTE FORUM</p>
                </div>
            </div>

            {/* Search */}
            <div className='ml-5 mr-5 mt-1.5 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4'>
                <button className='cursor-pointer' onClick={handleSearchSubmit}>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search discussions by title, subject, or tags...'
                    className='select-none flex flex-1 items-center bg-transparent font-["Inter"] text-[18px] outline-none border-none focus:outline-none focus:ring-0'
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Sort By */}
            <div className='mt-1 ml-5 flex flex-row items-center gap-3'>
                <p className='text-[#124C09] font-["Inter"] text-[18px] select-none'>Sort by:</p>
                <div className='flex flex-row gap-2'>
                    <button
                        onClick={() => setSortBy('views')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'views' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <MdOutlineRemoveRedEye size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>Views</span>
                    </button>
                    <button
                        onClick={() => setSortBy('comments')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'comments' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <BiCommentDetail size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>Comments</span>
                    </button>
                    <button
                        onClick={() => setSortBy('likes')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'likes' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <IoHeartOutline size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>Likes</span>
                    </button>
                    <button
                        onClick={() => setSortBy('date')}
                        className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === 'date' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <MdOutlineDateRange size={16} />
                        <span className='font-["Inter"] text-[14px] font-medium'>Date</span>
                    </button>
                </div>
            </div>

            {/* Filter By */}
            <div className='mt-3 ml-5 flex flex-row items-center gap-6 pb-2 pr-8 flex-wrap'>
                <p className='text-[#124C09] font-["Inter"] text-[18px] select-none'>Filter by:</p>
                <div className='flex flex-row items-center gap-2 flex-wrap'>
                    <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Include:</span>
                    {includeTags.map(tag => (
                        <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[12px] px-3 py-1 rounded-full font-medium'>
                            #{tag}
                            <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900'><IoClose size={13} /></button>
                        </span>
                    ))}
                    <input
                        type='text'
                        value={includeInput}
                        onChange={e => setIncludeInput(e.target.value)}
                        onKeyDown={handleIncludeKeyDown}
                        placeholder='Type a tag + Enter'
                        className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-36'
                    />
                </div>
                <div className='w-px bg-gray-200 self-stretch' />
                <div className='flex flex-row items-center gap-2 flex-wrap'>
                    <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Exclude:</span>
                    {excludeTags.map(tag => (
                        <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[12px] px-3 py-1 rounded-full font-medium'>
                            #{tag}
                            <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-800'><IoClose size={13} /></button>
                        </span>
                    ))}
                    <input
                        type='text'
                        value={excludeInput}
                        onChange={e => setExcludeInput(e.target.value)}
                        onKeyDown={handleExcludeKeyDown}
                        placeholder='Type a tag + Enter'
                        className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-36'
                    />
                </div>
            </div>
        </div>
    )
}

export default Note_forum_top_bar