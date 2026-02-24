import React from 'react'
import { BiMessageSquare } from "react-icons/bi";
import { RiSearch2Line } from "react-icons/ri";

const Note_forum_top_bar = () => {
    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row mt-1.5 gap-3 items-center'>
                <BiMessageSquare size={32} className='opacity-70 ml-5' />
                <p className='font-["Julius Sans One"] text-[32px] text-[#3E4A34] font-thin select-none'>NOTE FORUM</p>
            </div>
            <div className='ml-5 mr-5 mt-1.5 flex flex-row gap-3 w- items-center border-2 rounded-2xl p-1.5 pl-4 '>
                <button className='cursor-pointer'>
                    <RiSearch2Line size={22} className='flex opacity-50' />
                </button>
                <input type='text' placeholder='Search discussions by title, subject, or tags...' className='select-none flex flex-1 items-center bg-transparent font-["Inter"] text-[18px] outline-none border-none focus:outline-none focus:ring-0'></input>
            </div>
            <div className='ml-8 mt-2 text-[#577F4E] font-["Inter"] text-[16px] select-none'>
                Sorted by:
            </div>
        </div>
    )
}

export default Note_forum_top_bar