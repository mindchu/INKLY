import React from 'react'
import { PiBookOpenTextLight } from "react-icons/pi";
import { MdOutlineWhatshot } from "react-icons/md";
import { IoSparklesOutline } from "react-icons/io5";
import { BiTrendingUp } from "react-icons/bi";
import { useSortContext } from '../../context/SortContext';

const Home_Top_bar = () => {
  const { sortBy, setSortBy } = useSortContext();

  return (
    <div className='w-full bg-white shadow-md py-3'>
      <div className=''>
        <div className='flex flex-row items-center ml-5 mt-1.5 gap-3'>
          <PiBookOpenTextLight size={38} className='opacity-70' />
          <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>HOME</p>
        </div>
        <div className='mt-1 ml-5 flex flex-row items-center gap-3'>
          <p className='text-[#124C09] font-["Inter"] text-[18px] select-none'>Sorted by:</p>
          <div className='flex flex-row gap-2'>
            <button
              onClick={() => setSortBy('hot')}
              className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
                sortBy === 'hot' 
                  ? 'bg-[#F4A460] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MdOutlineWhatshot size={16} />
              <span className='font-["Inter"] text-[14px] font-medium'>Hot</span>
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
                sortBy === 'new' 
                  ? 'bg-[#6B9BD1] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <IoSparklesOutline size={16} />
              <span className='font-["Inter"] text-[14px] font-medium'>New</span>
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex flex-row items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
                sortBy === 'top' 
                  ? 'bg-[#FFD700] text-gray-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BiTrendingUp size={16} />
              <span className='font-["Inter"] text-[14px] font-medium'>Top</span>
            </button>
          </div>
        </div>
        <div className='ml-5 mt-2'>
          <p className='text-[#124C09] font-["Inter"] text-[18px] select-none'>Filter by:</p>
        </div>
      </div>
    </div>
  )
}

export default Home_Top_bar