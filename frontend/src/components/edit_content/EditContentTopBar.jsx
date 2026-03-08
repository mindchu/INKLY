import React from 'react'
import { MdEditDocument } from "react-icons/md";

const EditContentTopBar = () => {
    return (
        <div className='w-full bg-white shadow-md py-3 px-4 sm:px-6'>
            <div className='flex flex-row items-center justify-between gap-3 mt-1 sm:mt-2'>

                {/* Left — icon + title */}
                <div className='flex flex-row items-center gap-2 sm:gap-3 min-w-0'>
                    <MdEditDocument size={24} className='opacity-70 text-[#3A5335] flex-shrink-0 sm:w-8 sm:h-8' />
                    <p className='font-["Inter"] text-sm sm:text-xl md:text-3xl text-[#3E4A34] font-thin select-none uppercase tracking-wide truncate'>
                        Edit Content
                    </p>
                </div>

                {/* Right — actions */}
                <div className='flex items-center gap-2 sm:gap-4 flex-shrink-0'>
                    <button
                        onClick={() => window.handleCancelEdit?.()}
                        className='h-9 sm:h-10 px-3 sm:px-6 rounded-md border border-[#838181] opacity-60 font-["Inter"] text-sm sm:text-base cursor-pointer hover:bg-gray-100 hover:opacity-100 hover:border-[#5a5a5a] transition-all duration-200 whitespace-nowrap'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => window.handleSaveContent?.()}
                        className='h-9 sm:h-10 px-3 sm:px-6 rounded-md bg-[#34C759]/70 text-white font-["Inter"] text-sm sm:text-base cursor-pointer hover:bg-[#34C759] hover:scale-105 transition-all duration-200 whitespace-nowrap'
                    >
                        <span className='hidden sm:inline'>Save Changes</span>
                        <span className='sm:hidden'>Save</span>
                    </button>
                </div>

            </div>
        </div>
    )
}

export default EditContentTopBar