import React, { useState } from 'react'
import { RxCaretUp } from "react-icons/rx";
import { RxCaretDown } from "react-icons/rx";
import { RiSearch2Line } from "react-icons/ri";

const Search_top_bar = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    return (
        <div className={`w-full bg-white shadow-md transition-all duration-300 py-3`}>
            <div className='flex flex-row mt-1.5 gap-3 items-center'>
                <RiSearch2Line size={32} className='opacity-70 ml-5' />
                <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>SEARCH</p>
            </div>
            <div className='ml-5 mr-5 mt-1.5 flex flex-row gap-3 w- items-center border-2 rounded-2xl p-1.5 pl-4 '>
                <button className='cursor-pointer'>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input type='text' placeholder='Search discussions by title, subject, or tags...' className='select-none flex flex-1 items-center bg-transparent font-["Inter"] text-[18px] outline-none border-none focus:outline-none focus:ring-0'></input>
            </div>
            <div className='ml-5 mt-1.5 text-[#577F4E] font-["Inter"] flex fex-row items-center gap-2 select-none'>
                <button onClick={() => setShowFilters(!showFilters)} className='text-[#577F4E] font-["Inter"]'>
                    {showFilters ? <RxCaretUp strokeWidth={2} className='' /> : <RxCaretDown strokeWidth={2} className='' />}
                </button>
                <p>{showFilters ? 'Hide Filters' : 'Show Filters'}</p>
            </div>
            {showFilters && (
                <div className='flex flex-row gap-3 ml-5 pt-4 pl-8 pb-4 bg-[#F8F6F6] rounded-[12px] items-center select-none'>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[18px] text-[#577F4E] font-["Inter"]'>Sort by</label>
                        <select className='px-3 py-1.5 border-2 bg-white border-[#577F4E] rounded-lg font-["Inter"] cursor-pointer select-none'>
                            <option>Latest upload</option>
                        </select>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[18px] text-[#577F4E] font-["Inter"]'>Filter tags</label>
                        <select className='px-3 py-1.5 border-2 bg-white border-[#577F4E] rounded-lg font-["Inter"] cursor-pointer select-none'>
                            <option>Include any</option>
                        </select>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[18px] text-[#577F4E] font-["Inter"]'>Exclude tags</label>
                        <select className='px-3 py-1.5 border-2 bg-white border-[#577F4E] rounded-lg font-["Inter"] cursor-pointer select-none'>
                            <option>Exclude any</option>
                        </select>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[18px] text-[#577F4E] font-["Inter"]'>Subject</label>
                        <select className='px-3 py-1.5 border-2 bg-white border-[#577F4E] rounded-lg font-["Inter"] cursor-pointer select-none'>
                            <option>Any</option>
                        </select>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[18px] text-[#577F4E] font-["Inter"] mt-0.5'>Year</label>
                        <input type='text' placeholder='Any' className='px-3 py-1 h-8 border-2 bg-white border-[#577F4E] rounded-lg font-["Inter"] select-none' />
                    </div>
                </div>
            )}
            <div className='flex flex-row justify-between items-center ml-5 mr-5 mt-2.5 mb-2 border-b-2 border-none select-none'>
                <div className='flex flex-row gap-6'>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-1 font-["Inter"] text-[18px] ${activeTab === 'all' ? 'text-[#577F4E] border-b-2 border-[#577F4E]' : 'text-gray-500'}`}
                    >
                        All result
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`pb-1 font-["Inter"] text-[18px] ${activeTab === 'notes' ? 'text-[#577F4E] border-b-2 border-[#577F4E]' : 'text-gray-500'}`}
                    >
                        Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('discussion')}
                        className={`pb-1 font-["Inter"] text-[18px] ${activeTab === 'discussion' ? 'text-[#577F4E] border-b-2 border-[#577F4E]' : 'text-gray-500'}`}
                    >
                        Discussion
                    </button>
                </div>
                <button className='bg-[#34C759]/70 text-white px-6 py-1.5 rounded-sm font-["Inter"] text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'>
                    Search
                </button>
            </div>
        </div>
    )
}

export default Search_top_bar