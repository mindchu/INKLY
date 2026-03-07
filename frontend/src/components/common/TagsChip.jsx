import React from 'react';


export const TagsChipCreate = ({ tags, handleRemoveTag }) => {
    return (
        <>
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className='bg-[#E8F0E5] text-[#577F4E] px-3 py-1 rounded-full text-xs sm:text-sm inline-flex items-center gap-2 border border-[#C7D9C1] h-fit break-all'
                >
                    {tag}
                    <button
                        onClick={() => handleRemoveTag(tag)}
                        className='hover:text-[#C85A5A] transition-colors focus:outline-none flex items-center justify-center font-bold'
                    >
                        ×
                    </button>
                </span>
            ))}
        </>
    );
};

export const TagsChipView = ({ tags }) => {
    return (
        <>
            {tags && tags.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-4'>
                {tags.map((tag, tagIndex) => (
                    <span
                        key={tagIndex}
                        className='text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium break-all'
                    >
                        #{tag}
                    </span>
                ))}
            </div>
            )}
        </>
    )
}

export const TagsChipAdd = ({ tags, handleAddTag, interests }) =>  {
    return (
        <>
        {tags && Array.isArray(interests) &&
            tags.filter(tag => !interests.includes(tag.name))
            .slice(0, 10)
            .map((tag, index) => (
                <button
                key={index}
                onClick={() => handleAddTag(tag.name)}
                style={{ borderColor: tag.color }}
                className='px-3 py-1.5 bg-[#F5F7EF] text-[#7A8A73] rounded-full text-xs font-medium border hover:brightness-95 transition-all break-all'
                >
                + {tag.name}
                </button>
        ))}
        </>
    );
};

export const TagsChipProfile = ({ tags, allTags, handleRemoveTag }) => {
    return (
        <>
            {tags && Array.isArray(allTags) && tags.map((tag, index) => {
                const tagInfo = allTags.find(t => t.name === tag) || {};
                return (
                    <span
                        key={index}
                        style={{ backgroundColor: tagInfo.color || '#E8FFDF' }}
                        className='flex items-center gap-2 bg-[#E8FFDF] text-[#124C09] px-4 py-2 rounded-full text-sm font-medium break-all'
                    >
                        #{tag}
                        {handleRemoveTag && (
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className='text-[#124C09] hover:text-red-600 transition focus:outline-none flex items-center justify-center font-bold'
                            >
                                ✕
                            </button>
                        )}
                    </span>
                );
            })}
        </>
    );
};