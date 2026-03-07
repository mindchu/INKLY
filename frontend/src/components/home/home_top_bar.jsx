import React, { useState } from 'react'
import { PiBookOpenTextLight } from "react-icons/pi";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline, IoClose, IoSparkles, IoFilter } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { FiMenu, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useSortContext } from '../../context/SortContext';
import { useSidebar } from '../../context/SidebarContext';

const Home_Top_bar = () => {
  const { sortBy, setSortBy, includeTags, setIncludeTags, excludeTags, setExcludeTags } = useSortContext();
  const { toggleSidebar } = useSidebar();

  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  // Mobile: toggle filter panel open/closed
  const [filterOpen, setFilterOpen] = useState(false);

  const handleIncludeKeyDown = (e) => {
    if (e.key === 'Enter' && includeInput.trim()) {
      const tag = includeInput.trim();
      if (!includeTags.includes(tag)) {
        setIncludeTags(prev => [...prev, tag]);
      }
      setIncludeInput('');
    }
  };

  const handleExcludeKeyDown = (e) => {
    if (e.key === 'Enter' && excludeInput.trim()) {
      const tag = excludeInput.trim();
      if (!excludeTags.includes(tag)) {
        setExcludeTags(prev => [...prev, tag]);
      }
      setExcludeInput('');
    }
  };

  const removeIncludeTag = (tag) => setIncludeTags(prev => prev.filter(t => t !== tag));
  const removeExcludeTag = (tag) => setExcludeTags(prev => prev.filter(t => t !== tag));

  const activeFilterCount = includeTags.length + excludeTags.length;

  return (
    <div className='w-full bg-white shadow-md py-3'>
      <div className=''>

        {/* ── Top header row ───────────────────────────────── */}
        <div className='flex flex-row items-center ml-4 md:ml-5 mt-1.5 gap-3 justify-between w-full pr-4 md:pr-8'>
          <div className='flex flex-row items-center gap-3'>
            <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
              <FiMenu size={24} className="text-[#3E4A34]" />
            </button>
            <PiBookOpenTextLight size={38} className='opacity-70' />
            <p className='font-["Julius Sans One"] text-[28px] md:text-[32px] text-[#3E4A34] font-thin select-none'>HOME</p>
          </div>

          {/* Mobile-only: filter toggle button */}
          <button
            onClick={() => setFilterOpen(v => !v)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition relative"
          >
            <IoFilter size={14} />
            <span className='text-[12px] font-medium'>Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#3E4A34] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
            {filterOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          </button>
        </div>

        {/* ── Sort row — horizontally scrollable on mobile ── */}
        <div className='mt-1 ml-4 md:ml-5 flex flex-row items-center gap-2 overflow-x-auto scrollbar-hide pr-4 pb-1'>
          <p className='text-[#124C09] font-["Inter"] text-[15px] md:text-[18px] select-none whitespace-nowrap flex-shrink-0'>Sort by:</p>
          <div className='flex flex-row gap-2 flex-shrink-0'>
            <button
              onClick={() => setSortBy('recommended')}
              className={`flex flex-row items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${sortBy === 'recommended' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <IoSparkles size={14} />
              <span className='font-["Inter"] text-[13px] md:text-[14px] font-medium'>Recommended</span>
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`flex flex-row items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${sortBy === 'views' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <MdOutlineRemoveRedEye size={14} />
              <span className='font-["Inter"] text-[13px] md:text-[14px] font-medium'>Views</span>
            </button>
            <button
              onClick={() => setSortBy('comments')}
              className={`flex flex-row items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${sortBy === 'comments' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <BiCommentDetail size={14} />
              <span className='font-["Inter"] text-[13px] md:text-[14px] font-medium'>Comments</span>
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`flex flex-row items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${sortBy === 'likes' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <IoHeartOutline size={14} />
              <span className='font-["Inter"] text-[13px] md:text-[14px] font-medium'>Likes</span>
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`flex flex-row items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${sortBy === 'date' ? 'bg-[#3E4A34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <MdOutlineDateRange size={14} />
              <span className='font-["Inter"] text-[13px] md:text-[14px] font-medium'>Date</span>
            </button>
          </div>
        </div>

        {/* ── Filter row ───────────────────────────────────── */}
        {/* Desktop: always visible. Mobile: toggled by Filter button */}
        <div className={`overflow-hidden transition-all duration-300 ${filterOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'} md:max-h-none md:opacity-100`}>
          <div className='mt-3 ml-4 md:ml-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 pb-2 pr-4 md:pr-8 flex-wrap'>
            <p className='text-[#124C09] font-["Inter"] text-[18px] select-none hidden md:block'>Filter by:</p>

            {/* Include Tags */}
            <div className='flex flex-row items-center gap-2 flex-wrap'>
              <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Include:</span>
              {includeTags.map(tag => (
                <span key={tag} className='flex items-center gap-1 bg-green-100 text-green-700 text-[12px] px-3 py-1 rounded-full font-medium'>
                  #{tag}
                  <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900'>
                    <IoClose size={13} />
                  </button>
                </span>
              ))}
              <input
                type='text'
                value={includeInput}
                onChange={e => setIncludeInput(e.target.value)}
                onKeyDown={handleIncludeKeyDown}
                placeholder='Type a tag + Enter'
                className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-32 md:w-36'
              />
            </div>

            <div className='hidden md:block w-px bg-gray-200 self-stretch' />

            {/* Exclude Tags */}
            <div className='flex flex-row items-center gap-2 flex-wrap'>
              <span className='text-gray-500 font-["Inter"] text-[13px] select-none'>Exclude:</span>
              {excludeTags.map(tag => (
                <span key={tag} className='flex items-center gap-1 bg-red-100 text-red-600 text-[12px] px-3 py-1 rounded-full font-medium'>
                  #{tag}
                  <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-800'>
                    <IoClose size={13} />
                  </button>
                </span>
              ))}
              <input
                type='text'
                value={excludeInput}
                onChange={e => setExcludeInput(e.target.value)}
                onKeyDown={handleExcludeKeyDown}
                placeholder='Type a tag + Enter'
                className='text-[13px] font-["Inter"] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-32 md:w-36'
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home_Top_bar