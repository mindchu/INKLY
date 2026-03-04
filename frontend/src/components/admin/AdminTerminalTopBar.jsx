import React from 'react'
import { MdAdminPanelSettings } from "react-icons/md";

const AdminTerminalTopBar = () => {
    return (
        <div className='w-full bg-white shadow-md py-3'>
            <div className='flex flex-row gap-3 items-center mt-2 ml-5 justify-between w-full pr-8'>
                <div className='flex flex-row items-center gap-3'>
                    <MdAdminPanelSettings size={32} className='opacity-70 text-[#3E4A34]' />
                    <h1 className='text-[#3E4A34] font-["Inter"] font-thin text-[32px] select-none uppercase'>Admin Terminal</h1>
                </div>
            </div>
        </div>
    )
}

export default AdminTerminalTopBar
