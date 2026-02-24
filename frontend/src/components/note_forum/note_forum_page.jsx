import React from 'react'
import { GiPlainCircle } from "react-icons/gi";
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline } from "react-icons/io5";
import { GoComment } from "react-icons/go";
import { LuEye } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
const Note_forum_page = () => {
    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className='flex flex-col gap-[24px] px-[40px] py-[50px]'>
                <div className='flex flex-col w-full min-h-[150px] bg-white rounded-[12px] p-[12px]'>
                    {/* Header - Author and Attachment */}
                    <div className='flex justify-between flex-row w-full'>
                        <div className='flex flex-row justify-center gap-[12px] items-center'>
                            <GiPlainCircle size={30} className='text-[#577F4E]' />
                            <div>
                                <p className='font-["Inter"] text-[14px] font-semibold text-[#124C09]/70'>Student1</p>
                                <p className='font-["Inter"] text-[9px] font-regular text-[#124C09]/70'>2 hours ago</p>
                            </div>
                        </div>
                        <div className='mt-[8px] mr-[20px]'>
                            <button className='w-[160px] h-[30px] bg-[#B3B3B6]/60 text-white items-center flex justify-center rounded-[12px] gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                <GoPaperclip size={14} className='text-white' />
                                <p>1 Attachment(s)</p>
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div className='mt-[16px]'>
                        <p className='font-["Inter"] text-[18px] font-regular'>How to approach complex integration problems?</p>
                    </div>

                    {/* Description */}
                    <div className='mt-[12px]'>
                        <p className='font-["Inter"] text-[13px] font-regular'>I'm struggling with trigonometric substitution in integration. Can someone explain the intuition behind choosing the right substitution?</p>
                    </div>

                    {/* Tags and Stats */}
                    <div className='flex flex-row justify-between mt-[16px]'>
                        {/* Tags */}
                        <div className='flex flex-row items-center gap-[8px] flex-wrap'>
                            <p className='flex w-auto bg-[#E8FFDF] items-center px-[10px] rounded-[12px] text-[#124C09]/70 font-["Inter"] text-[12px] font-regular'>#Calculus</p>
                            <p className='flex w-auto bg-[#E8FFDF] items-center px-[10px] rounded-[12px] text-[#124C09]/70 font-["Inter"] text-[12px] font-regular'>#Integration</p>
                            <p className='flex w-auto bg-[#E8FFDF] items-center px-[10px] rounded-[12px] text-[#124C09]/70 font-["Inter"] text-[12px] font-regular'>#Math</p>
                        </div>

                        {/* Stats */}
                        <div className='flex flex-row gap-[18px] mr-[32px]'>
                            <button className='cursor-pointer gap-[6px] items-center flex flex-row'>
                                <IoHeartOutline size={14} className='text-[#292D32] ' />
                                <p className='font-["Inter"] text-[12px] font-regular select-none'>332</p>
                            </button>
                            <button className='cursor-pointer gap-[6px] items-center flex flex-row'>
                                <GoComment size={14} className='text-[#292D32]' />
                                <p className='font-["Inter"] text-[12px] font-regular select-none'>44</p>
                            </button>
                            <div className='gap-[6px] items-center flex flex-row'>
                                <LuEye size={14} className='text-[#292D32]' />
                                <p className='font-["Inter"] text-[12px] font-regular select-none'>1277</p>
                            </div>
                            <div className='gap-[6px] items-center flex flex-row'>
                                <MdOutlineFileDownload size={14} className='text-[#292D32]' />
                                <p className='font-["Inter"] text-[12px] font-regular select-none'>156</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Note_forum_page