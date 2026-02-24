import React from 'react'
import { RiStickyNoteAddLine } from "react-icons/ri";

const Create_note_top_bar = () => {
    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row gap-3 items-center mt-2'>
                <RiStickyNoteAddLine size={32} className='opacity-70 ml-5' />
                <p className='font-["Inter"] text-[32px] text-[#3E4A34] font-thin select-none'>CREATE NEW NOTES</p>
                <div className='flex gap-6 ml-auto mr-5'>
                    <button className='w-[150px] h-[40px] rounded-md border border-[#838181] opacity-60 font-["Inter"] text-[16px] cursor-pointer hover:bg-gray-100 hover:opacity-100 hover:border-[#5a5a5a] transition-all duration-200'>Cancel</button>
                    <button className='w-[150px] h-[40px] rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'>Publish Note</button>
                </div>
            </div>
        </div>
    )
}

export default Create_note_top_bar