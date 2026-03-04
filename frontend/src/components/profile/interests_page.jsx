import React, { useState, useEffect } from 'react';
import { FaTag, FaPlus } from "react-icons/fa6";
import { api } from '../../util/api';
import { useProfileContext } from '../../context/ProfileContext';

const Interests_page = () => {
    const { profileData, loading: profileLoading } = useProfileContext();
    const [allTags, setAllTags] = useState([]);
    const [userInterests, setUserInterests] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tagsRes = await api.get('/tags/all');
                setAllTags(tagsRes.tags || []);

                if (profileData && profileData.interested_tags) {
                    setUserInterests(profileData.interested_tags);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!profileLoading) {
            fetchData();
        }
    }, [profileData, profileLoading]);

    const handleAddTag = async (tag) => {
        const normalizedTag = tag.trim();
        if (normalizedTag && !userInterests.includes(normalizedTag)) {
            const newInterests = [...userInterests, normalizedTag];
            setUserInterests(newInterests);
            setTagInput('');
            await saveInterests(newInterests);
        }
    };

    const handleRemoveTag = async (tagToRemove) => {
        const newInterests = userInterests.filter(tag => tag !== tagToRemove);
        setUserInterests(newInterests);
        await saveInterests(newInterests);
    };

    const saveInterests = async (tags) => {
        setSaving(true);
        try {
            await api.post('/users/me/interests', { tags });
        } catch (error) {
            console.error('Error saving interests:', error);
            alert('Failed to save interests');
        } finally {
            setSaving(false);
        }
    };

    if (loading || profileLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#EEF2E1]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B9D63]"></div>
            </div>
        );
    }

    const filteredSuggestions = allTags.filter(tag =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !userInterests.includes(tag.name)
    );

    return (
        <div className='w-full min-h-screen bg-[#EEF2E1] overflow-auto font-["Inter"]'>
            <div className='max-w-4xl mx-auto p-8'>
                <div className='bg-white rounded-2xl shadow-sm border border-[#E3E8D9] p-8'>
                    <div className='mb-8'>
                        <h1 className='text-3xl font-bold text-[#2C3E28] mb-2'>Manage Interests</h1>
                        <p className='text-[#7A8A73]'>Select topics you're interested in to personalize your feed.</p>
                    </div>

                    {/* Current Interests */}
                    <div className='mb-10'>
                        <h2 className='text-lg font-semibold text-[#3A5335] mb-4 flex items-center gap-2'>
                            <FaTag className='text-[#6B9D63]' />
                            My Interested Tags
                        </h2>
                        <div className='flex flex-wrap gap-2'>
                            {userInterests.length > 0 ? (
                                userInterests.map((tagName, index) => {
                                    const tagInfo = allTags.find(t => t.name === tagName) || {};
                                    return (
                                        <span
                                            key={index}
                                            style={{ backgroundColor: tagInfo.color || '#E8F0E5' }}
                                            className='inline-flex items-center gap-2 px-4 py-2 text-[#577F4E] rounded-full text-sm font-medium border border-[#C7D9C1] transition-all hover:brightness-95'
                                        >
                                            {tagName}
                                            <button
                                                onClick={() => handleRemoveTag(tagName)}
                                                className='hover:text-[#C85A5A] transition-colors font-bold'
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })
                            ) : (
                                <p className='text-[#9AAF94] italic'>You haven't added any interests yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Add Tags */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-[#3A5335] mb-4'>Add More Interests</h2>
                        <div className='relative'>
                            <div className='flex gap-2 max-w-md'>
                                <input
                                    type='text'
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(tagInput)}
                                    placeholder='Search or add a tag...'
                                    className='flex-1 px-4 py-3 border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all text-[#2C3E28] placeholder:text-[#9AAF94]'
                                />
                                <button
                                    onClick={() => handleAddTag(tagInput)}
                                    className='px-6 py-3 bg-[#6B9D63] text-white rounded-xl hover:bg-[#577F4E] transition-all duration-200 font-medium flex items-center gap-2'
                                >
                                    <FaPlus size={14} />
                                    Add
                                </button>
                            </div>

                            {/* Suggestions Dropdown */}
                            {tagInput && filteredSuggestions.length > 0 && (
                                <div className='absolute z-10 mt-2 w-full max-w-md bg-white border border-[#D4D9C6] rounded-xl shadow-lg overflow-hidden'>
                                    {filteredSuggestions.slice(0, 5).map((tag, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAddTag(tag.name)}
                                            className='w-full text-left px-4 py-3 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors flex items-center justify-between border-b border-[#F0F2EA] last:border-0'
                                        >
                                            <div className='flex items-center gap-2'>
                                                <div className='w-3 h-3 rounded-full' style={{ backgroundColor: tag.color }}></div>
                                                <span>{tag.name}</span>
                                            </div>
                                            <FaPlus size={12} className='text-[#9AAF94]' />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div>
                        <h2 className='text-lg font-semibold text-[#3A5335] mb-4'>Suggested for You</h2>
                        <div className='flex flex-wrap gap-2'>
                            {allTags
                                .filter(tag => !userInterests.includes(tag.name))
                                .slice(0, 15)
                                .map((tag, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAddTag(tag.name)}
                                        style={{ borderColor: tag.color }}
                                        className='px-4 py-2 bg-[#F5F7EF] text-[#7A8A73] rounded-full text-sm font-medium border hover:brightness-95 transition-all'
                                    >
                                        + {tag.name}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>

                {saving && (
                    <div className='fixed bottom-8 right-8 bg-[#6B9D63] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce'>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving changes...
                    </div>
                )}
            </div>
        </div>
    );
};

export default Interests_page;
