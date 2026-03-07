import React, { useEffect } from 'react'
import { RiSearch2Line } from "react-icons/ri";
import { GoPeople } from "react-icons/go";
import { FiMenu } from "react-icons/fi";
import { useSearch } from '../../context/SearchContext';
import { useSidebar } from '../../context/SidebarContext';

const Follow_top_bar = () => {
    const { query, setQuery } = useSearch();
    const { toggleSidebar } = useSidebar();

    useEffect(() => {
        setQuery('');
        return () => setQuery('');
    }, [setQuery]);

    return (
        <div className='w-full bg-white shadow-md py-3'>
            {/* Header row */}
            <div className='flex flex-row mt-1.5 gap-3 items-center mx-4 sm:mx-5 justify-between'>
                <div className='flex flex-row items-center gap-3'>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
                        <FiMenu size={24} className="text-[#3E4A34]" />
                    </button>
                    <GoPeople size={28} className='opacity-70 hidden sm:block' />
                    <p className='font-["Julius_Sans_One"] text-[24px] sm:text-[32px] text-[#3E4A34] font-thin select-none'>FOLLOWING</p>
                </div>
            </div>

            {/* Search input */}
            <div className='mx-4 sm:mx-5 mt-1.5 flex flex-row gap-3 items-center border-2 rounded-2xl p-1.5 pl-4 mb-5'>
                <button className='cursor-pointer flex-shrink-0'>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input
                    type='text'
                    placeholder='Search people you follow...'
                    value={query || ''}
                    onChange={(e) => setQuery(e.target.value)}
                    className='flex flex-1 min-w-0 bg-transparent font-["Inter"] text-[15px] sm:text-[18px] outline-none border-none focus:outline-none focus:ring-0 select-none'
                />
            </div>
        </div>
    )
}

export default Follow_top_bar