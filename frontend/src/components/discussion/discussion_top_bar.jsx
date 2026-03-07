import React, { useState } from 'react'
import { BiMessageSquare } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline, IoClose } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { FiMenu } from "react-icons/fi";
import { useSortContext } from '../../context/SortContext';
import { useSidebar } from '../../context/SidebarContext';

const SORT_OPTIONS = [
    { key: 'views',    icon: <MdOutlineRemoveRedEye size={12} />, label: 'Views' },
    { key: 'comments', icon: <BiCommentDetail size={12} />,       label: 'Comments' },
    { key: 'likes',    icon: <IoHeartOutline size={12} />,        label: 'Likes' },
    { key: 'date',     icon: <MdOutlineDateRange size={12} />,    label: 'Date' },
];

const Discussion_top_bar = () => {
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

            {/* ── Header row ─────────────────────────────────────────── */}
            <div className='flex flex-row items-center ml-4 md:ml-5 mt-1.5 gap-3 justify-between w-full pr-4 md:pr-8'>
                <div className='flex flex-row items-center gap-3'>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
                        <FiMenu size={24} className="text-[#3E4A34]" />
                    </button>
                    <BiMessageSquare size={32} className='opacity-70' />
                    <p className='font-["Julius Sans One"] text-[24px] md:text-[32px] text-[#3E4A34] font-thin select-none'>DISCUSSION FORUM</p>
                </div>
            </div>

            {/* ── Search ─────────────────────────────────────────────── */}
            <div className='mx-4 md:mx-5 mt-2 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4'>
                <button className='cursor-pointer flex-shrink-0' onClick={handleSearchSubmit}>
                    <RiSearch2Line size={20} className='opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search discussions by title, subject, or tags...'
                    className='select-none flex flex-1 min-w-0 bg-transparent font-["Inter"] text-[15px] md:text-[18px] outline-none border-none focus:outline-none focus:ring-0'
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* ── Sort row ───────────────────────────────────────────── */}
            <div className='mt-2 ml-4 md:ml-5 pr-4 md:pr-8'>
                {/* Desktop */}
                <div className='hidden md:flex flex-row items-center gap-3'>
                    <p className='text-[#124C09] font-["Inter"] text-[18px] select-none'>Sort by:</p>
                    <div className='flex flex-row gap-2'>
                        {SORT_OPTIONS.map(({ key, icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
                                    sortBy === key ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {icon}
                                <span className='font-["Inter"] text-[14px] font-medium'>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile — wraps */}
                <div className='md:hidden'>
                    <p className='text-[#124C09] font-["Inter"] text-[13px] font-medium mb-1.5 select-none'>Sort by:</p>
                    <div className='flex flex-row flex-wrap gap-1.5'>
                        {SORT_OPTIONS.map(({ key, icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`flex flex-row items-center gap-1 px-3 py-1.5 rounded-full transition-all text-[12px] font-medium font-["Inter"] ${
                                    sortBy === key ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Filter row — Desktop ────────────────────────────────── */}
            <div className='hidden md:block'>
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
                            type='text' value={includeInput}
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
                            type='text' value={excludeInput}
                            onChange={e => setExcludeInput(e.target.value)}
                            onKeyDown={handleExcludeKeyDown}
                            placeholder='Type a tag + Enter'
                            className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-36'
                        />
                    </div>
                </div>
            </div>

            {/* ── Filter row — Mobile ─────────────────────────────────── */}
            <div className='md:hidden mt-3 ml-4 pr-4 pb-1 flex flex-col gap-2'>
                <p className='text-[#124C09] font-["Inter"] text-[13px] font-medium select-none'>Filter by:</p>
                <div className='flex flex-row items-center gap-2 flex-wrap'>
                    <span className='text-gray-500 text-[12px] select-none'>Include:</span>
                    {includeTags.map(tag => (
                        <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium'>
                            #{tag}
                            <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900'><IoClose size={11} /></button>
                        </span>
                    ))}
                    <input
                        type='text' value={includeInput}
                        onChange={e => setIncludeInput(e.target.value)}
                        onKeyDown={handleIncludeKeyDown}
                        placeholder='Tag + Enter'
                        className='text-[12px] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-28'
                    />
                </div>
                <div className='flex flex-row items-center gap-2 flex-wrap'>
                    <span className='text-gray-500 text-[12px] select-none'>Exclude:</span>
                    {excludeTags.map(tag => (
                        <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium'>
                            #{tag}
                            <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-800'><IoClose size={11} /></button>
                        </span>
                    ))}
                    <input
                        type='text' value={excludeInput}
                        onChange={e => setExcludeInput(e.target.value)}
                        onKeyDown={handleExcludeKeyDown}
                        placeholder='Tag + Enter'
                        className='text-[12px] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-28'
                    />
                </div>
            </div>

        </div>
    );
}

export default Discussion_top_bar