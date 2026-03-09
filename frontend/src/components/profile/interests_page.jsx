import React, { useState, useEffect } from 'react';
import { FaTag, FaPlus } from "react-icons/fa6";
import { api } from '../../util/api';
import { useProfileContext } from '../../context/ProfileContext';
import { TagsChipAdd, TagsChipCreate } from '../common/TagsChip';
import { Tag } from 'lucide-react';

const Interests_page = () => {
    const { profileData, loading: profileLoading, updateProfile, setProfileData } = useProfileContext();
    const [allTags, setAllTags] = useState([]);
    const [userInterests, setUserInterests] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const hasFetched = React.useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            try {
                const tagsRes = await api.get('/tags/all');
                setAllTags(tagsRes.tags || []);

                if (profileData && profileData.interested_tags) {
                    setUserInterests(profileData.interested_tags);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                hasFetched.current = false;
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
            await updateProfile({
                username: profileData.username,
                bio: profileData.bio,
                interests: tags
            });
            setProfileData(prev => ({ ...prev, interested_tags: tags }));
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
            <div className='max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8'>
                <div className='bg-white rounded-2xl shadow-sm border border-[#E3E8D9] p-5 md:p-8'>

                    {/* Header */}
                    <div className='mb-6 md:mb-8'>
                        <h1 className='text-2xl md:text-3xl font-bold text-[#2C3E28] mb-2'>Manage Interests</h1>
                        <p className='text-sm md:text-base text-[#7A8A73]'>Select topics you're interested in to personalize your feed.</p>
                    </div>

                    {/* Current Interests */}
                    <div className='mb-8 md:mb-10'>
                        <h2 className='text-base md:text-lg font-semibold text-[#3A5335] mb-4 flex items-center gap-2'>
                            <FaTag className='text-[#6B9D63]' />
                            My Interested Tags
                        </h2>
                        <div className='flex flex-wrap gap-2'>
                            {userInterests.length > 0 ? (
                                <TagsChipCreate tags={userInterests} handleRemoveTag={handleRemoveTag} />
                            ) : (
                                <p className='text-[#9AAF94] italic text-sm'>You haven't added any interests yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Add Tags */}
                    <div className='mb-6 md:mb-8'>
                        <h2 className='text-base md:text-lg font-semibold text-[#3A5335] mb-4'>Add More Interests</h2>
                        <div className='relative'>
                            <div className='flex gap-2 w-full md:max-w-md'>
                                <input
                                    type='text'
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(tagInput)}
                                    placeholder='Search or add a tag...'
                                    className='flex-1 min-w-0 px-3 md:px-4 py-2.5 md:py-3 border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all text-sm md:text-base text-[#2C3E28] placeholder:text-[#9AAF94]'
                                />
                                <button
                                    onClick={() => handleAddTag(tagInput)}
                                    className='px-4 md:px-6 py-2.5 md:py-3 bg-[#6B9D63] text-white rounded-xl hover:bg-[#577F4E] transition-all duration-200 font-medium flex items-center gap-1.5 md:gap-2 text-sm md:text-base flex-shrink-0'
                                >
                                    <FaPlus size={12} className='md:hidden' />
                                    <FaPlus size={14} className='hidden md:block' />
                                    Add
                                </button>
                            </div>
                            <br />
                            {/* Suggestions Dropdown */}
                            {tagInput && filteredSuggestions.length > 0 && (
                                <TagsChipAdd tags={filteredSuggestions} handleAddTag={handleAddTag} interests={userInterests} />
                            )}
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div>
                        <h2 className='text-base md:text-lg font-semibold text-[#3A5335] mb-4'>Suggested for You</h2>
                        <div className='flex flex-wrap gap-2'>
                            <TagsChipAdd tags={allTags} handleAddTag={handleAddTag} interests={userInterests} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Saving toast — moves up on mobile to clear tab bar */}
            {saving && (
                <div className='fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-[#6B9D63] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full shadow-lg flex items-center gap-2 md:gap-3 animate-bounce text-sm md:text-base'>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving changes...
                </div>
            )}
        </div>
    );
};

export default Interests_page;