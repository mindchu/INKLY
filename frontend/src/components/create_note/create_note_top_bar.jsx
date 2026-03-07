import React from 'react'
import { RiStickyNoteAddLine } from "react-icons/ri";
import { FiMenu } from "react-icons/fi";
import { useSidebar } from '../../context/SidebarContext';

const Create_note_top_bar = () => {
    const { toggleSidebar } = useSidebar();

    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row gap-3 items-center mt-2 mx-4 sm:mx-5 justify-between'>
                <div className='flex flex-row items-center gap-3'>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-gray-100 rounded-lg">
                        <FiMenu size={24} className="text-[#3E4A34]" />
                    </button>
                    <RiStickyNoteAddLine size={28} className='opacity-70 hidden sm:block' />
                    <p className='font-["Inter"] text-[20px] sm:text-[32px] text-[#3E4A34] font-thin select-none'>CREATE NEW NOTES</p>
                </div>
                <button
                    onClick={() => window.handlePublishNote?.()}
                    className='flex-shrink-0 px-4 sm:w-[150px] h-[36px] sm:h-[40px] rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-[14px] sm:text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'
                >
                    Publish
                </button>
            </div>
        </div>
    )
}

export default Create_note_top_bar