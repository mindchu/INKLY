import React, { useState } from 'react'
import { RxCaretUp } from "react-icons/rx";
import { RxCaretDown } from "react-icons/rx";
import { RiSearch2Line } from "react-icons/ri";
import { FiMenu } from "react-icons/fi";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { useSearch } from '../../context/SearchContext';
import { useSidebar } from '../../context/SidebarContext';

const Search_top_bar = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const { query, setQuery, performSearch, filters, setFilters, allTags } = useSearch();
    const { toggleSidebar } = useSidebar();

    const [filterTagInput, setFilterTagInput] = useState('');
    const [excludeTagInput, setExcludeTagInput] = useState('');

    const filteredSuggestions = allTags ? allTags.filter(tag =>
        tag.name.toLowerCase().includes(filterTagInput.toLowerCase()) &&
        !filters.tags.includes(tag.name)
    ) : [];

    const excludeSuggestions = allTags ? allTags.filter(tag =>
        tag.name.toLowerCase().includes(excludeTagInput.toLowerCase()) &&
        !filters.exclude_tags.includes(tag.name)
    ) : [];

    const handleSearchClick = () => {
        performSearch();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const sortButtons = [
        { value: 'views', label: 'Views', icon: <MdOutlineRemoveRedEye size={16} /> },
        { value: 'comments', label: 'Comments', icon: <BiCommentDetail size={16} /> },
        { value: 'likes', label: 'Likes', icon: <IoHeartOutline size={16} /> },
        { value: 'recent', label: 'Date', icon: <MdOutlineDateRange size={16} /> },
    ];

    return (
        <div className='w-full bg-white shadow-md transition-all duration-300 py-3'>
            {/* Header row */}
            <div className='flex flex-row mt-1.5 gap-3 items-center mx-4 sm:mx-5 justify-between'>
                <div className='flex flex-row items-center gap-3'>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
                        <FiMenu size={24} className="text-[#3E4A34]" />
                    </button>
                    <RiSearch2Line size={28} className='opacity-70 hidden sm:block' />
                    <p className='font-["Julius_Sans_One"] text-[24px] sm:text-[32px] text-[#3E4A34] font-thin select-none'>SEARCH</p>
                </div>
            </div>

            {/* Search input */}
            <div className='mx-4 sm:mx-5 mt-1.5 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4'>
                <button className='cursor-pointer flex-shrink-0' onClick={handleSearchClick}>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search by title, subject, or tags...'
                    className='flex flex-1 min-w-0 items-center bg-transparent font-["Inter"] text-[15px] sm:text-[18px] outline-none border-none focus:outline-none focus:ring-0'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Filter toggle */}
            <div className='mx-4 sm:mx-5 mt-1.5 text-[#577F4E] font-["Inter"] flex flex-row items-center gap-2 select-none'>
                <button onClick={() => setShowFilters(!showFilters)} className='text-[#577F4E] font-["Inter"] flex items-center gap-1'>
                    {showFilters ? <RxCaretUp strokeWidth={2} /> : <RxCaretDown strokeWidth={2} />}
                    <p className='text-sm'>{showFilters ? 'Hide Filters' : 'Show Filters'}</p>
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className='flex flex-col lg:flex-row gap-4 mx-4 sm:mx-5 mt-2 pt-4 px-4 sm:px-8 pb-4 bg-[#F8F6F6] rounded-[12px] select-none'>

                    {/* Sort By */}
                    <div className='flex flex-col gap-1'>
                        <label className='text-[15px] sm:text-[18px] text-[#577F4E] font-["Inter"] mb-0.5'>Sort by</label>
                        <div className='flex flex-row flex-wrap gap-2 min-h-[38px]'>
                            {sortButtons.map(({ value, label, icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setFilters({ ...filters, sort: value })}
                                    className={`flex flex-row items-center gap-1.5 px-3 sm:px-4 h-[36px] rounded-full transition-all text-sm ${
                                        filters.sort === value
                                            ? 'bg-[#3E4A34] text-white'
                                            : 'bg-white border border-[#577F4E] text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {icon}
                                    <span className='font-["Inter"] text-[13px] sm:text-[14px] font-medium'>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Tags */}
                    <div className='flex flex-col gap-1 relative flex-1 min-w-0'>
                        <label className='text-[15px] sm:text-[18px] text-[#577F4E] font-["Inter"]'>Filter tags</label>
                        <div className='relative w-full border-2 bg-white border-[#577F4E] rounded-lg min-h-[38px] flex flex-wrap items-center gap-1.5 px-2 py-1'>
                            {filters.tags.map((tag, idx) => (
                                <span key={idx} className='bg-[#EDF2EB] text-[#577F4E] px-2 py-0.5 rounded text-sm flex items-center gap-1 border border-[#D1DFCC] h-fit whitespace-nowrap'>
                                    {tag}
                                    <button onClick={() => setFilters({ ...filters, tags: filters.tags.filter(t => t !== tag) })} className='hover:text-red-500 font-["Inter"] font-bold'>×</button>
                                </span>
                            ))}
                            <input
                                type='text'
                                value={filterTagInput}
                                onChange={(e) => setFilterTagInput(e.target.value)}
                                placeholder={filters.tags.length === 0 ? 'Type to search...' : ''}
                                className='flex-1 min-w-[80px] bg-transparent outline-none border-none font-["Inter"] text-[14px] sm:text-[16px] text-gray-700 placeholder-gray-400 py-0.5'
                            />
                            {filterTagInput && filteredSuggestions.length > 0 && (
                                <div className='absolute top-full left-0 z-20 mt-1 w-full bg-white border border-[#D4D9C6] rounded-xl shadow-lg max-h-[150px] overflow-y-auto'>
                                    {filteredSuggestions.slice(0, 5).map((tag, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setFilters({ ...filters, tags: [...filters.tags, tag.name] });
                                                setFilterTagInput('');
                                            }}
                                            className='w-full text-left px-3 py-2 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors flex items-center justify-between border-b border-[#F0F2EA] last:border-0'
                                        >
                                            <div className='flex items-center gap-2'>
                                                <div className='w-2 h-2 rounded-full' style={{ backgroundColor: tag.color || '#E8F0E5' }}></div>
                                                <span className='font-["Inter"] text-[14px]'>{tag.name}</span>
                                            </div>
                                            <span className='text-xs text-gray-400 font-["Inter"]'>({tag.use_count})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Exclude Tags */}
                    <div className='flex flex-col gap-1 relative flex-1 min-w-0'>
                        <label className='text-[15px] sm:text-[18px] text-[#577F4E] font-["Inter"]'>Exclude tags</label>
                        <div className='relative w-full border-2 bg-white border-[#577F4E] rounded-lg min-h-[38px] flex flex-wrap items-center gap-1.5 px-2 py-1'>
                            {(filters.exclude_tags || []).map((tag, idx) => (
                                <span key={idx} className='bg-[#FCE8E8] text-[#C0392B] px-2 py-0.5 rounded text-sm flex items-center gap-1 border border-[#F5C6C6] h-fit whitespace-nowrap'>
                                    {tag}
                                    <button onClick={() => setFilters({ ...filters, exclude_tags: filters.exclude_tags.filter(t => t !== tag) })} className='hover:text-red-700 font-["Inter"] font-bold'>×</button>
                                </span>
                            ))}
                            <input
                                type='text'
                                value={excludeTagInput}
                                onChange={(e) => setExcludeTagInput(e.target.value)}
                                placeholder={(filters.exclude_tags && filters.exclude_tags.length > 0) ? '' : 'Type to search...'}
                                className='flex-1 min-w-[80px] bg-transparent outline-none border-none font-["Inter"] text-[14px] sm:text-[16px] text-gray-700 placeholder-gray-400 py-0.5'
                            />
                            {excludeTagInput && excludeSuggestions.length > 0 && (
                                <div className='absolute top-full left-0 z-20 mt-1 w-full bg-white border border-[#D4D9C6] rounded-xl shadow-lg max-h-[150px] overflow-y-auto'>
                                    {excludeSuggestions.slice(0, 5).map((tag, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const currentExcludes = filters.exclude_tags || [];
                                                setFilters({ ...filters, exclude_tags: [...currentExcludes, tag.name] });
                                                setExcludeTagInput('');
                                            }}
                                            className='w-full text-left px-3 py-2 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors flex items-center justify-between border-b border-[#F0F2EA] last:border-0'
                                        >
                                            <div className='flex items-center gap-2'>
                                                <div className='w-2 h-2 rounded-full' style={{ backgroundColor: tag.color || '#E8F0E5' }}></div>
                                                <span className='font-["Inter"] text-[14px]'>{tag.name}</span>
                                            </div>
                                            <span className='text-xs text-gray-400 font-["Inter"]'>({tag.use_count})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs + Search button */}
            <div className='flex flex-row justify-between items-center mx-4 sm:mx-5 mt-2.5 mb-2 select-none'>
                <div className='flex flex-row gap-3 sm:gap-6 overflow-x-auto'>
                    {['all', 'notes', 'discussion'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-1 font-["Inter"] text-[15px] sm:text-[18px] whitespace-nowrap capitalize ${
                                activeTab === tab
                                    ? 'text-[#577F4E] border-b-2 border-[#577F4E]'
                                    : 'text-gray-500'
                            }`}
                        >
                            {tab === 'all' ? 'All results' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleSearchClick}
                    className='flex-shrink-0 ml-3 bg-[#34C759]/70 text-white px-4 sm:px-6 py-1.5 rounded-sm font-["Inter"] text-[14px] sm:text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'
                >
                    Search
                </button>
            </div>
        </div>
    )
}

export default Search_top_bar