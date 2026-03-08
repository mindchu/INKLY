import React, { useState } from 'react'
import { RiSearch2Line } from "react-icons/ri";
import { BiChat, BiCommentDetail } from "react-icons/bi";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline, IoClose } from "react-icons/io5";
import { useMyNotesContext } from '../../context/MyNotesContext';
import { useSearch } from '../../context/SearchContext';
import { useEffect, useRef } from 'react';

const My_discussions_top_bar = () => {
    const { localSearch, setLocalSearch, fetchSearch, sortBy, setSortBy, includeTags, setIncludeTags, excludeTags, setExcludeTags } = useMyNotesContext();
    const { allTags } = useSearch();

    const [includeInput, setIncludeInput] = useState('');
    const [excludeInput, setExcludeInput] = useState('');
    const [showIncludeSuggestions, setShowIncludeSuggestions] = useState(false);
    const [showExcludeSuggestions, setShowExcludeSuggestions] = useState(false);

    const includeContainerRef = useRef(null);
    const excludeContainerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (includeContainerRef.current && !includeContainerRef.current.contains(event.target)) {
                setShowIncludeSuggestions(false);
            }
            if (excludeContainerRef.current && !excludeContainerRef.current.contains(event.target)) {
                setShowExcludeSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const includeSuggestions = allTags.filter(tag =>
        tag.name.toLowerCase().includes(includeInput.toLowerCase()) &&
        !includeTags.includes(tag.name)
    );

    const excludeSuggestions = allTags.filter(tag =>
        tag.name.toLowerCase().includes(excludeInput.toLowerCase()) &&
        !excludeTags.includes(tag.name)
    );

    const handleSearchSubmit = () => fetchSearch(localSearch);
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearchSubmit(); };

    const handleIncludeKeyDown = (e) => {
        if (e.key === 'Enter' && includeInput.trim()) {
            const tag = includeInput.trim();
            if (!includeTags.includes(tag)) setIncludeTags(prev => [...prev, tag]);
            setIncludeInput('');
            setShowIncludeSuggestions(false);
        }
    };

    const handleExcludeKeyDown = (e) => {
        if (e.key === 'Enter' && excludeInput.trim()) {
            const tag = excludeInput.trim();
            if (!excludeTags.includes(tag)) setExcludeTags(prev => [...prev, tag]);
            setExcludeInput('');
            setShowExcludeSuggestions(false);
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

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className='flex flex-row mt-1.5 gap-3 items-center mx-4 sm:mx-5 justify-between'>
                <div className='flex flex-row items-center gap-3'>
                    <BiChat size={28} className='opacity-70 text-[#3E4A34]' />
                    <p className='font-["Julius_Sans_One"] text-[18px] sm:text-[32px] text-[#3E4A34] font-thin select-none'>MY DISCUSSIONS</p>
                </div>
            </div>

            {/* ── Search ─────────────────────────────────────────────── */}
            <div className='mx-4 sm:mx-5 mt-1.5 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4'>
                <button className='cursor-pointer flex-shrink-0' onClick={handleSearchSubmit}>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search discussions by title, text, or tags...'
                    className='flex flex-1 min-w-0 bg-transparent font-["Inter"] text-[15px] sm:text-[18px] outline-none border-none focus:outline-none focus:ring-0 select-none'
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* ── Sort By ────────────────────────────────────────────── */}
            <div className='mt-2 mx-4 sm:mx-5 flex flex-row items-center gap-2 sm:gap-3 flex-wrap'>
                <p className='text-[#124C09] font-["Inter"] text-[15px] sm:text-[18px] select-none'>Sort by:</p>
                <div className='flex flex-row gap-2 flex-wrap'>
                    {sortButtons.map(({ value, label, icon }) => (
                        <button
                            key={value}
                            onClick={() => setSortBy(value)}
                            className={`flex flex-row items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full transition-all ${sortBy === value
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

            {/* ── Filter By ──────────────────────────────────────────── */}
            <div className='mt-3 mx-4 sm:mx-5 pb-2'>

                {/* Desktop */}
                <div className='hidden sm:flex flex-row items-start gap-3 flex-wrap'>
                    <p className='text-[#124C09] font-["Inter"] text-[18px] select-none flex-shrink-0 pt-1'>Filter by:</p>
                    <div className='flex flex-row gap-3 flex-1 min-w-0'>
                        <div className='flex flex-row items-center gap-2 flex-wrap'>
                            <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Include:</span>
                            {includeTags.map(tag => (
                                <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[12px] px-3 py-1 rounded-full font-medium whitespace-nowrap'>
                                    #{tag}
                                    <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900'><IoClose size={13} /></button>
                                </span>
                            ))}
                            <div className='relative' ref={includeContainerRef}>
                                <input
                                    type='text' value={includeInput}
                                    onChange={e => {
                                        setIncludeInput(e.target.value);
                                        setShowIncludeSuggestions(true);
                                    }}
                                    onKeyDown={handleIncludeKeyDown}
                                    onFocus={() => setShowIncludeSuggestions(true)}
                                    placeholder='Tag + Enter'
                                    className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-36'
                                />
                                {showIncludeSuggestions && includeSuggestions.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {includeSuggestions.slice(0, 5).map((tag, idx) => (
                                            <button
                                                key={idx}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!includeTags.includes(tag.name)) setIncludeTags(prev => [...prev, tag.name]);
                                                    setIncludeInput('');
                                                    setShowIncludeSuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] text-gray-700 flex items-center justify-between border-b border-gray-50 last:border-0"
                                            >
                                                <span>#{tag.name}</span>
                                                <span className="text-[10px] text-gray-400">({tag.use_count})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='w-px bg-gray-200 self-stretch' />
                        <div className='flex flex-row items-center gap-2 flex-wrap'>
                            <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Exclude:</span>
                            {excludeTags.map(tag => (
                                <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[12px] px-3 py-1 rounded-full font-medium whitespace-nowrap'>
                                    #{tag}
                                    <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-800'><IoClose size={13} /></button>
                                </span>
                            ))}
                            <div className='relative' ref={excludeContainerRef}>
                                <input
                                    type='text' value={excludeInput}
                                    onChange={e => {
                                        setExcludeInput(e.target.value);
                                        setShowExcludeSuggestions(true);
                                    }}
                                    onKeyDown={handleExcludeKeyDown}
                                    onFocus={() => setShowExcludeSuggestions(true)}
                                    placeholder='Tag + Enter'
                                    className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-36'
                                />
                                {showExcludeSuggestions && excludeSuggestions.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {excludeSuggestions.slice(0, 5).map((tag, idx) => (
                                            <button
                                                key={idx}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!excludeTags.includes(tag.name)) setExcludeTags(prev => [...prev, tag.name]);
                                                    setExcludeInput('');
                                                    setShowExcludeSuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] text-gray-700 flex items-center justify-between border-b border-gray-50 last:border-0"
                                            >
                                                <span>#{tag.name}</span>
                                                <span className="text-[10px] text-gray-400">({tag.use_count})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile — matches Discussion style */}
                <div className='sm:hidden flex flex-col gap-2'>
                    <p className='text-[#124C09] font-["Inter"] text-[13px] font-medium select-none'>Filter by:</p>
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <span className='text-gray-500 text-[12px] select-none'>Include:</span>
                        {includeTags.map(tag => (
                            <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium'>
                                #{tag}
                                <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900'><IoClose size={11} /></button>
                            </span>
                        ))}
                        <div className='relative' ref={includeContainerRef}>
                            <input
                                type='text' value={includeInput}
                                onChange={e => {
                                    setIncludeInput(e.target.value);
                                    setShowIncludeSuggestions(true);
                                }}
                                onKeyDown={handleIncludeKeyDown}
                                onFocus={() => setShowIncludeSuggestions(true)}
                                placeholder='Tag + Enter'
                                className='text-[12px] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-28'
                            />
                            {showIncludeSuggestions && includeSuggestions.length > 0 && (
                                <div className="absolute z-50 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg max-h-32 overflow-y-auto">
                                    {includeSuggestions.slice(0, 5).map((tag, idx) => (
                                        <button
                                            key={idx}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!includeTags.includes(tag.name)) setIncludeTags(prev => [...prev, tag.name]);
                                                setIncludeInput('');
                                                setShowIncludeSuggestions(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-[12px] text-gray-700 flex items-center justify-between border-b border-gray-50 last:border-0"
                                        >
                                            <span>#{tag.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <span className='text-gray-500 text-[12px] select-none'>Exclude:</span>
                        {excludeTags.map(tag => (
                            <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium'>
                                #{tag}
                                <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-800'><IoClose size={11} /></button>
                            </span>
                        ))}
                        <div className='relative' ref={excludeContainerRef}>
                            <input
                                type='text' value={excludeInput}
                                onChange={e => {
                                    setExcludeInput(e.target.value);
                                    setShowExcludeSuggestions(true);
                                }}
                                onKeyDown={handleExcludeKeyDown}
                                onFocus={() => setShowExcludeSuggestions(true)}
                                placeholder='Tag + Enter'
                                className='text-[12px] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-28'
                            />
                            {showExcludeSuggestions && excludeSuggestions.length > 0 && (
                                <div className="absolute z-50 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg max-h-32 overflow-y-auto">
                                    {excludeSuggestions.slice(0, 5).map((tag, idx) => (
                                        <button
                                            key={idx}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!excludeTags.includes(tag.name)) setExcludeTags(prev => [...prev, tag.name]);
                                                setExcludeInput('');
                                                setShowExcludeSuggestions(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-[12px] text-gray-700 flex items-center justify-between border-b border-gray-50 last:border-0"
                                        >
                                            <span>#{tag.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default My_discussions_top_bar