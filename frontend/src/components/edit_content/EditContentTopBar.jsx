import React from 'react'
import { MdEditDocument } from "react-icons/md";

const EditContentTopBar = () => {

    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row gap-3 items-center mt-2 ml-5 justify-between w-full pr-8'>
                <div className='flex flex-row items-center gap-3'>
                    <MdEditDocument size={32} className='opacity-70 text-[#3A5335]' />
                    <p className='font-["Inter"] text-[32px] text-[#3E4A34] font-thin select-none uppercase'>EDIT CONTENT</p>
                </div>
                <div className='flex gap-6 ml-auto mr-5 items-center'>
                    <button
                        onClick={() => window.handleCancelEdit?.()}
                        className='w-[150px] h-[40px] rounded-md border border-[#838181] opacity-60 font-["Inter"] text-[16px] cursor-pointer hover:bg-gray-100 hover:opacity-100 hover:border-[#5a5a5a] transition-all duration-200'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => window.handleSaveContent?.()}
                        className='w-[150px] h-[40px] rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-[16px] cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200'
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditContentTopBar
