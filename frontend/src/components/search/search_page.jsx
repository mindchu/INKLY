import React, { useState } from 'react'
import { GiPlainCircle } from "react-icons/gi";
import { GoPaperclip } from "react-icons/go";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { PiChatText } from "react-icons/pi";
import { LuEye } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
import { BsBookmarkDashFill, BsBookmarkDash } from "react-icons/bs";
import otherNotes from '../../constants/Others_note_data';
import { useBookmarks } from '../../context/BookmarksContext';

const Search_page = () => {
    const { toggleBookmark, isBookmarked } = useBookmarks();
    
    // State to track likes for each note
    const [noteLikes, setNoteLikes] = useState(() => {
        const initialLikes = {};
        otherNotes.forEach(note => {
            initialLikes[note.id] = {
                count: note.likes,
                isLiked: false
            };
        });
        return initialLikes;
    });

    // Handle like button click
    const handleLike = (noteId) => {
        setNoteLikes(prev => ({
            ...prev,
            [noteId]: {
                count: prev[noteId]?.isLiked ? prev[noteId].count - 1 : (prev[noteId]?.count || otherNotes.find(n => n.id === noteId)?.likes || 0) + 1,
                isLiked: !prev[noteId]?.isLiked
            }
        }));
    };

    // Helper function to format large numbers
    const formatViews = (views) => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return views.toString();
    };

    return (
        <div className='w-full h-full bg-[#EEF2E1] overflow-auto p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {otherNotes.map((note) => (
                    <div key={note.id} className='flex w-full h-auto rounded-[16px] bg-white p-6'>
                        <div className='w-full'>
                            <p className='font-[Inter] text-[20px] text-[#124C09] font-semibold'>
                                {note.title}
                            </p>
                            <div className='mt-[16px] flex flex-row items-center gap-[10px]'>
                                <GiPlainCircle size={12} className='text-[#577F4E]' />
                                <p className='font-[Inter] text-[18px] text-[#124C09] font-semibold'>
                                    {note.author}
                                </p>
                            </div>
                            <p className='mt-[12px] font-[Inter] text-[14px] text-[#124C09] font-semibold line-clamp-3'>
                                {note.description}
                            </p>
                            
                            {note.attachments > 0 && (
                                <div className='w-full flex justify-center'>
                                    <button className='flex flex-row w-[160px] h-[30px] items-center mt-[10px] justify-center bg-[#b3b3b6a4] rounded-[12px] gap-[8px] cursor-pointer select-none hover:bg-[#B3B3B6]/80'>
                                        <GoPaperclip size={12} className='text-white' />
                                        <p className='text-white font-[Inter] text-[14px] font-semibold'>
                                            {note.attachments} Attachment(s)
                                        </p>
                                    </button>
                                </div>
                            )}
                            
                            <div className='flex flex-row mt-[12px] items-center gap-[8px] flex-wrap'>
                                {note.tags.map((tag, index) => (
                                    <p key={index} className='flex h-[28px] w-auto bg-[#E8FFDF] items-center px-[8px] rounded-[12px] text-[#124C09]/70 text-[13px]'>
                                        #{tag}
                                    </p>
                                ))}
                            </div>
                            
                            <div className='mt-[20px] w-full border-[1px]'></div>
                            
                            <div className='flex flex-row justify-between mt-[12px]'>
                                <div className='gap-[6px] flex flex-row items-center'>
                                    <button 
                                        onClick={() => handleLike(note.id)}
                                        className='cursor-pointer flex flex-row items-center gap-[6px]'
                                    >
                                        {noteLikes[note.id]?.isLiked ? (
                                            <IoHeart size={14} className='text-red-500' />
                                        ) : (
                                            <IoHeartOutline size={14} className='text-[#292D32]' />
                                        )}
                                        <p className={`font-[Inter] text-[14px] font-semibold select-none ${noteLikes[note.id]?.isLiked ? 'text-red-500' : 'text-[#124C09]'}`}>
                                            {noteLikes[note.id]?.count || note.likes}
                                        </p>
                                    </button>
                                    <button className='cursor-pointer flex flex-row items-center gap-[6px]'>
                                        <PiChatText size={14} className='text-[#292D32]' />
                                        <p className='font-[Inter] text-[14px] font-semibold text-[#124C09] select-none'>
                                            {note.comments}
                                        </p>
                                    </button>
                                    <div className='flex flex-row items-center gap-[6px]'>
                                        <LuEye size={14} className='text-[#292D32]' />
                                        <p className='font-[Inter] text-[14px] font-semibold text-[#124C09] select-none'>
                                            {formatViews(note.views)}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex flex-row items-center gap-[16px]'>
                                    <button className='cursor-pointer'>
                                        <MdOutlineFileDownload size={14} className='text-[#292D32]' />
                                    </button>
                                    <button 
                                        onClick={() => toggleBookmark(note)}
                                        className={`cursor-pointer ${isBookmarked(note.id) ? 'text-yellow-400' : 'text-[#292D32]'}`}
                                    >
                                        {isBookmarked(note.id) ? (
                                            <BsBookmarkDashFill size={14} />
                                        ) : (
                                            <BsBookmarkDash size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Search_page