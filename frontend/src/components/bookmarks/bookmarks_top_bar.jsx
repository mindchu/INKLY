import React, { useState, useEffect, useRef } from 'react'
import { BsBookmark } from "react-icons/bs";
import { MdOutlineDateRange, MdOutlineRemoveRedEye } from "react-icons/md";
import { IoClose, IoHeartOutline } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";
import { useBookmarks } from '../../context/BookmarksContext';
import { useSearch } from '../../context/SearchContext';

const SORT_OPTIONS = [
    { key: 'views', icon: <MdOutlineRemoveRedEye size={12} />, label: 'Views' },
    { key: 'comments', icon: <BiCommentDetail size={12} />, label: 'Comments' },
    { key: 'likes', icon: <IoHeartOutline size={12} />, label: 'Likes' },
    { key: 'date', icon: <MdOutlineDateRange size={12} />, label: 'Date' },
];

const Bookmarks_top_bar = () => {
    const { localSearch, setLocalSearch, fetchSearch, includeTags, setIncludeTags, excludeTags, setExcludeTags, sortBy, setSortBy } = useBookmarks();
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

    return (
        <div className='w-full bg-white shadow-md py-3'>

            {/* ── Header row ─────────────────────────────────────────── */}
            <div className='flex flex-row items-center ml-4 md:ml-5 mt-1.5 gap-3 justify-between w-full pr-4 md:pr-8'>
                <div className='flex flex-row items-center gap-3'>
                    <BsBookmark size={32} className='opacity-70' />
                    <p className='font-["Julius_Sans_One"] text-[18px] md:text-[32px] text-[#3E4A34] font-thin select-none'>BOOKMARKS</p>
                </div>
            </div>

            {/* ── Search ─────────────────────────────────────────────── */}
            <div className='mx-4 md:mx-5 mt-2 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4'>
                <button className='cursor-pointer flex-shrink-0' onClick={handleSearchSubmit}>
                    <RiSearch2Line size={20} className='opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search bookmarks by title, text, or tags...'
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
                    <p className='text-[#577F4E] font-["Inter"] text-[18px] select-none'>Sort by:</p>
                    <div className='flex flex-row gap-2'>
                        {SORT_OPTIONS.map(({ key, icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${sortBy === key ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {icon}
                                <span className='font-["Inter"] text-[14px] font-medium'>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile */}
                <div className='md:hidden'>
                    <p className='text-[#577F4E] font-["Inter"] text-[13px] font-medium mb-1.5 select-none'>Sort by:</p>
                    <div className='flex flex-row flex-wrap gap-1.5'>
                        {SORT_OPTIONS.map(({ key, icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`flex flex-row items-center gap-1 px-3 py-1.5 rounded-full transition-all text-[12px] font-medium font-["Inter"] ${sortBy === key ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    <p className='text-[#577F4E] font-["Inter"] text-[18px] select-none'>Filter by:</p>
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Include:</span>
                        {includeTags.map(tag => (
                            <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[12px] px-3 py-1 rounded-full font-medium'>
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
                                placeholder='Type a tag + Enter'
                                className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#577F4E] w-36'
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
                            <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[12px] px-3 py-1 rounded-full font-medium'>
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
                                placeholder='Type a tag + Enter'
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

            {/* ── Filter row — Mobile ─────────────────────────────────── */}
            <div className='md:hidden mt-3 ml-4 pr-4 pb-1 flex flex-col gap-2'>
                <p className='text-[#577F4E] font-["Inter"] text-[13px] font-medium select-none'>Filter by:</p>
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
                            className='text-[12px] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#577F4E] w-28'
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
    );
}

export default Bookmarks_top_bar;