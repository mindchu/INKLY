import React, { useMemo } from 'react'
import { GiPlainCircle } from "react-icons/gi";
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline } from "react-icons/io5";
import { GoComment } from "react-icons/go";
import { LuEye } from "react-icons/lu";
import { FaShare } from "react-icons/fa";
import { discussionPosts, getRecentPosts, getPopularPosts } from '../../constants/Discussion_data';
import { useSortContext } from '../../context/SortContext';

const Discussion_page = () => {
    const { sortBy } = useSortContext(); // Get sort state from context

    // Get sorted posts based on selected option
    const sortedPosts = useMemo(() => {
        switch(sortBy) {
            case 'new':
                return getRecentPosts(); // Newest first
            case 'top':
                return getPopularPosts(); // Most liked first
            case 'hot':
            default:
                // For 'hot', use engagement score (likes + comments * 2)
                return [...discussionPosts].sort((a, b) => {
                    const scoreA = a.likes + (a.comments * 2);
                    const scoreB = b.likes + (b.comments * 2);
                    return scoreB - scoreA;
                });
        }
    }, [sortBy]);

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
            <div className='flex flex-col gap-[24px] px-[40px] py-[50px]'>
                {sortedPosts.map((post) => (
                    <div key={post.id} className='flex flex-col w-full min-h-[150px] bg-white rounded-[12px] p-[12px]'>
                        {/* Header - Author and Attachment */}
                        <div className='flex justify-between flex-row w-full'>
                            <div className='flex flex-row justify-center gap-[12px] items-center'>
                                <GiPlainCircle size={30} className='text-[#577F4E]' />
                                <div>
                                    <p className='font-["Inter"] text-[14px] font-semibold text-[#124C09]/70'>{post.author}</p>
                                    <p className='font-["Inter"] text-[9px] font-regular text-[#124C09]/70'>{post.lastActivity}</p>
                                </div>
                            </div>
                            {post.attachments > 0 && (
                                <div className='mt-[8px] mr-[20px]'>
                                    <button className='w-[160px] h-[30px] bg-[#B3B3B6]/60 text-white items-center flex justify-center rounded-[12px] gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                        <GoPaperclip size={14} className='text-white' />
                                        <p>{post.attachments} Attachment(s)</p>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div className='mt-[16px]'>
                            <p className='font-["Inter"] text-[18px] font-regular'>{post.title}</p>
                        </div>

                        {/* Description */}
                        <div className='mt-[12px]'>
                            <p className='font-["Inter"] text-[13px] font-regular'>{post.description}</p>
                        </div>

                        {/* Tags and Stats */}
                        <div className='flex flex-row justify-between mt-[16px]'>
                            {/* Tags */}
                            <div className='flex flex-row items-center gap-[8px] flex-wrap'>
                                {post.tags.map((tag, index) => (
                                    <p key={index} className='flex w-auto bg-[#E8FFDF] items-center px-[10px] rounded-[12px] text-[#124C09]/70 font-["Inter"] text-[12px] font-regular'>
                                        #{tag}
                                    </p>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className='flex flex-row gap-[18px] mr-[32px]'>
                                <button className='cursor-pointer gap-[6px] items-center flex flex-row'>
                                    <IoHeartOutline size={14} className='text-[#292D32]' />
                                    <p className='font-["Inter"] text-[12px] font-regular select-none'>{post.likes}</p>
                                </button>
                                <button className='cursor-pointer gap-[6px] items-center flex flex-row'>
                                    <GoComment size={14} className='text-[#292D32]' />
                                    <p className='font-["Inter"] text-[12px] font-regular select-none'>{post.comments}</p>
                                </button>
                                <div className='gap-[6px] items-center flex flex-row'>
                                    <LuEye size={14} className='text-[#292D32]' />
                                    <p className='font-["Inter"] text-[12px] font-regular select-none'>{post.views}</p>
                                </div>
                                <button className='cursor-pointer flex flex-row'>
                                    <FaShare size={14} className='text-[#292D32]' />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Discussion_page