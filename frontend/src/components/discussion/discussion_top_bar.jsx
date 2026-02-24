import React from 'react'
import { BiMessageSquare } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";
import { MdOutlineWhatshot } from "react-icons/md";
import { IoSparklesOutline } from "react-icons/io5";
import { BiTrendingUp } from "react-icons/bi";
import { useSortContext } from '../../context/SortContext';

const Discussion_top_bar = () => {
    const { sortBy, setSortBy } = useSortContext(); // Get sort state from context

    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row mt-1.5 gap-3 items-center'>
                <BiMessageSquare size={32} className='opacity-70 ml-5' />
                <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>DISCUSSION FORUM</p>
            </div>
            <div className='ml-5 mr-5 mt-1.5 flex flex-row gap-3 w- items-center border-2 rounded-2xl p-1.5 pl-4 '>
                <button className='cursor-pointer'>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input type='text' placeholder='Search discussions by title, subject, or tags...' className='select-none flex flex-1 items-center bg-transparent font-["Inter"] text-[18px] outline-none border-none focus:outline-none focus:ring-0'></input>
            </div>
            <div className='ml-8 mt-3 flex flex-row items-center gap-3'>
                <p className='text-[#577F4E] font-["Inter"] text-[16px] select-none'>
                    Sorted by:
                </p>
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
        </div>
    )
}

export default Discussion_top_bar