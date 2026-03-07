import React, { useState } from 'react'
import { PiBookOpenTextLight } from "react-icons/pi";
import { MdOutlineRemoveRedEye, MdOutlineDateRange } from "react-icons/md";
import { IoHeartOutline, IoClose, IoSparkles, IoFilter } from "react-icons/io5";
import { BiCommentDetail } from "react-icons/bi";
import { FiMenu, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useSortContext } from '../../context/SortContext';
import { useSidebar } from '../../context/SidebarContext';

const SORT_OPTIONS = [
  { key: 'recommended', icon: <IoSparkles size={13} />,           label: 'Recommended' },
  { key: 'views',       icon: <MdOutlineRemoveRedEye size={13} />, label: 'Views' },
  { key: 'comments',    icon: <BiCommentDetail size={13} />,       label: 'Comments' },
  { key: 'likes',       icon: <IoHeartOutline size={13} />,        label: 'Likes' },
  { key: 'date',        icon: <MdOutlineDateRange size={13} />,    label: 'Date' },
];

const Home_Top_bar = () => {
  const { sortBy, setSortBy, includeTags, setIncludeTags, excludeTags, setExcludeTags } = useSortContext();
  const { toggleSidebar } = useSidebar();

  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

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
    <div className='w-full bg-white border-b border-gray-100 shadow-sm'>

      {/* ── Header row ─────────────────────────────────────── */}
      <div className='flex items-center justify-between px-4 md:px-6 pt-3 pb-2'>
        <div className='flex items-center gap-2.5'>
          <button onClick={toggleSidebar} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg">
            <FiMenu size={22} className="text-[#3E4A34]" />
          </button>
          <PiBookOpenTextLight size={28} className='opacity-60 hidden sm:block' />
          <p className='font-["Julius_Sans_One"] text-[24px] md:text-[30px] text-[#3E4A34] font-thin select-none tracking-wide'>
            HOME
          </p>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFilterOpen(v => !v)}
          className="md:hidden relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-[12px] font-medium"
        >
          <IoFilter size={13} />
          Filter
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#3E4A34] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
          {filterOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
        </button>
      </div>

      {/* ── Sort row ─────────────────────────────────────────── */}
      <div className='px-4 md:px-6 pb-2'>
        <div className='flex items-center gap-2 overflow-x-auto scrollbar-hide'>
          <span className='text-[#124C09] text-[13px] md:text-[15px] font-medium select-none whitespace-nowrap flex-shrink-0 mr-1'>
            Sort:
          </span>
          {SORT_OPTIONS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 text-[12px] md:text-[13px] font-medium ${
                sortBy === key
                  ? 'bg-[#3E4A34] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter panel — mobile toggleable, desktop always visible ── */}
      <div className={`overflow-hidden transition-all duration-300 ${filterOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'} md:max-h-none md:opacity-100`}>
        <div className='px-4 md:px-6 pb-3 pt-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 flex-wrap border-t border-gray-50 md:border-0'>
          <span className='text-[#124C09] text-[15px] font-medium select-none hidden md:block'>Filter by:</span>

          {/* Include */}
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-gray-400 text-[12px] select-none'>Include:</span>
            {includeTags.map(tag => (
              <span key={tag} className='flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[11px] px-2.5 py-0.5 rounded-full font-medium'>
                #{tag}
                <button onClick={() => removeIncludeTag(tag)} className='hover:text-green-900 ml-0.5'>
                  <IoClose size={11} />
                </button>
              </span>
            ))}
            <input
              type='text'
              value={includeInput}
              onChange={e => setIncludeInput(e.target.value)}
              onKeyDown={handleIncludeKeyDown}
              placeholder='Add tag + Enter'
              className='text-[12px] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-[#3E4A34] w-28 md:w-32 bg-gray-50'
            />
          </div>

          <div className='hidden md:block w-px h-5 bg-gray-200' />

          {/* Exclude */}
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-gray-400 text-[12px] select-none'>Exclude:</span>
            {excludeTags.map(tag => (
              <span key={tag} className='flex items-center gap-1 bg-red-50 text-red-500 border border-red-200 text-[11px] px-2.5 py-0.5 rounded-full font-medium'>
                #{tag}
                <button onClick={() => removeExcludeTag(tag)} className='hover:text-red-700 ml-0.5'>
                  <IoClose size={11} />
                </button>
              </span>
            ))}
            <input
              type='text'
              value={excludeInput}
              onChange={e => setExcludeInput(e.target.value)}
              onKeyDown={handleExcludeKeyDown}
              placeholder='Add tag + Enter'
              className='text-[12px] border border-gray-200 rounded-full px-3 py-1 outline-none focus:border-red-400 w-28 md:w-32 bg-gray-50'
            />
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home_Top_bar