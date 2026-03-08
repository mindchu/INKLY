import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTag } from "react-icons/fa6";
import { MdDriveFolderUpload } from "react-icons/md";
import { api } from '../../util/api';
import { useProfileContext } from '../../context/ProfileContext';
import { TagsChipCreate } from '../common/TagsChip';

const EditContentPage = () => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const { profileData } = useProfileContext();

    const [noteTitle, setNoteTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [licenseAgreement, setLicenseAgreement] = useState(false);

    const [tagInput, setTagInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [userInterests, setUserInterests] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const hasFetchedTags = useRef(false);

    useEffect(() => {
        const fetchTags = async () => {
            if (hasFetchedTags.current) return;
            hasFetchedTags.current = true;
            try {
                const [allTagsRes, profileRes] = await Promise.all([
                    api.get('/tags/all'),
                    api.get('/users/me')
                ]);
                setPopularTags(allTagsRes.tags || []);
                setUserInterests(profileRes.interested_tags || []);
            } catch (error) {
                console.error('Error fetching tags:', error);
                hasFetchedTags.current = false;
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await api.get(`/content/${contentId}`);
                if (response?.data) {
                    if (profileData && response.data.author_id !== profileData.google_id) {
                        alert('You are not authorized to edit this content.');
                        navigate(-1);
                        return;
                    }
                    setNoteTitle(response.data.title || '');
                    setContent(response.data.text || '');
                    if (response.data.tags) {
                        setTags(response.data.tags.map(t => typeof t === 'string' ? t : t.name));
                    }
                    if (response.data.file_paths) {
                        setExistingAttachments(response.data.file_paths);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch content details:', error);
                alert('Failed to load content for editing.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        if (profileData) fetchContent();
    }, [contentId, navigate, profileData]);

    useEffect(() => {
        if (tagInput.trim()) {
            const interestTagObjects = userInterests.map(name => {
                const found = popularTags.find(t => t.name === name);
                return found || { name, color: '#E8F0E5' };
            });
            const combined = [...popularTags];
            interestTagObjects.forEach(it => {
                if (!combined.find(t => t.name === it.name)) combined.push(it);
            });
            const filtered = combined.filter(tag =>
                tag.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag.name)
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [tagInput, tags, userInterests, popularTags]);

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
    };

    const handleFileInput = (e) => {
        if (e.target.files?.[0]) handleFiles(e.target.files);
    };

    const handleFiles = (files) => {
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 10 * 1024 * 1024;
        Array.from(files).forEach(file => {
            if (validTypes.includes(file.type) && file.size <= maxSize) {
                setAttachments(prev => [...prev, file]);
            } else {
                alert(`File ${file.name} is not valid. Please upload PDF, PNG, JPG, or DOCX files under 10MB.`);
            }
        });
    };

    const handleRemoveNewAttachment = (index) => setAttachments(attachments.filter((_, i) => i !== index));
    const handleRemoveExistingAttachment = (pathToRemove) => setExistingAttachments(existingAttachments.filter(path => path !== pathToRemove));

    const handleSave = async () => {
        if (!noteTitle.trim() || !content.trim()) {
            alert('Please fill in both title and content fields.');
            return;
        }
        if (attachments.length > 0 && !licenseAgreement) {
            alert('Please confirm you have the right to upload these new files by checking the license agreement.');
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', noteTitle);
            formData.append('text', content);
            formData.append('type', 'post');
            formData.append('license_agreement', licenseAgreement);
            tags.forEach(tag => formData.append('tags', tag));
            attachments.forEach(file => formData.append('files', file));
            existingAttachments.forEach(filePath => formData.append('existing_file_paths', filePath));
            const response = await api.put(`/content/${contentId}`, formData, true);
            if (response.success) {
                navigate(`/content/${contentId}`);
            } else {
                alert('Failed to update content: ' + (response.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Updating error:', error);
            alert('Error updating content. Please try again.');
        } finally {
            if (saving) setSaving(false);
        }
    };

    const handleCancelClick = () => setShowCancelModal(true);
    const handleConfirmCancel = () => {
        setShowCancelModal(false);
        navigate(-1);
    };

    // Expose handlers to TopBar (both mobile and desktop)
    useEffect(() => {
        window.handleSaveContent = handleSave;
        window.handleCancelEdit = handleCancelClick;
        return () => {
            delete window.handleSaveContent;
            delete window.handleCancelEdit;
        };
    }, [noteTitle, content, tags, attachments, existingAttachments, licenseAgreement]);

    if (loading) {
        return (
            <div className='w-full h-screen bg-[#EEF2E1] flex items-center justify-center font-["Inter"]'>
                <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading content...</div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-[#EEF2E1] overflow-x-hidden overflow-y-auto font-["Inter"]'>
            <div className='max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 md:py-8 pb-24 md:pb-8 min-w-0'>
                <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#E3E8D9] p-4 sm:p-6 md:p-8 overflow-hidden min-w-0'>

                    {/* --- Title --- */}
                    <div className='mb-5 sm:mb-6'>
                        <label className='block text-sm font-medium text-[#3A5335] mb-1.5 sm:mb-2'>
                            Content Title <span className='text-[#C85A5A]'>*</span>
                        </label>
                        <input
                            type='text'
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder='Enter title...'
                            className='w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#D4D9C6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all text-[#2C3E28] placeholder:text-[#9AAF94] text-sm sm:text-base'
                        />
                    </div>

                    {/* --- Content --- */}
                    <div className='mb-5 sm:mb-6'>
                        <label className='block text-sm font-medium text-[#3A5335] mb-1.5 sm:mb-2'>
                            Content <span className='text-[#C85A5A]'>*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder='Write your content here...'
                            className='w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#D4D9C6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all resize-none h-48 sm:h-56 md:h-64 text-[#2C3E28] placeholder:text-[#9AAF94] text-sm sm:text-base'
                        />
                        <p className='text-xs sm:text-sm text-[#7A8A73] mt-1.5'>
                            {content.length} characters
                        </p>
                    </div>

                    {/* --- Tags --- */}
                    <div className='mb-5 sm:mb-6'>
                        <label className='block text-sm font-medium text-[#3A5335] mb-1.5 sm:mb-2'>
                            <span className='flex items-center gap-2'>
                                <FaTag className='text-[#577F4E]' size={13} />
                                Tags
                            </span>
                        </label>
                        <div className='relative'>
                            <div className='relative w-full border border-[#D4D9C6] bg-white rounded-lg min-h-[42px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#6B9D63] focus-within:border-transparent transition-all'>
                                <TagsChipCreate tags={tags} handleRemoveTag={handleRemoveTag} />
                                <input
                                    type='text'
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                    onFocus={() => tagInput.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                                    placeholder={tags.length === 0 ? 'Add tags (e.g. Calculus, Math)' : ''}
                                    className='flex-1 min-w-[100px] bg-transparent outline-none border-none text-[#2C3E28] placeholder:text-[#9AAF94] py-1 text-sm'
                                />
                            </div>
                            {showSuggestions && (
                                <div className='absolute z-10 mt-1 w-full bg-white border border-[#D4D9C6] rounded-lg shadow-lg overflow-hidden max-h-[200px] overflow-y-auto'>
                                    {suggestions.slice(0, 5).map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setTags([...tags, suggestion.name || suggestion]);
                                                setTagInput('');
                                                setShowSuggestions(false);
                                            }}
                                            className='w-full text-left px-4 py-2.5 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors flex items-center justify-between border-b border-[#F0F2EA] last:border-0'
                                        >
                                            <div className='flex items-center gap-2 min-w-0'>
                                                {suggestion.color && (
                                                    <div className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: suggestion.color }} />
                                                )}
                                                <span className='text-sm truncate'>{suggestion.name || suggestion}</span>
                                            </div>
                                            {userInterests.includes(suggestion.name || suggestion) ? (
                                                <span className='text-[10px] bg-[#E8F0E5] text-[#577F4E] px-2 py-0.5 rounded-full shrink-0 ml-2'>Interested</span>
                                            ) : (
                                                <span className='text-xs text-gray-400 shrink-0 ml-2'>({suggestion.use_count || 0})</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Attachments --- */}
                    <div className='w-full min-w-0 overflow-hidden'>
                        <label className='block text-sm font-medium text-[#3A5335] mb-1.5 sm:mb-2'>
                            <span className='flex items-center gap-2'>
                                <MdDriveFolderUpload className='text-[#577F4E]' size={17} />
                                Attachments
                            </span>
                        </label>

                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`w-full min-w-0 border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-all overflow-hidden ${dragActive ? 'border-[#6B9D63] bg-[#F0F5ED]' : 'border-[#D4D9C6] bg-[#FAFBF8]'}`}
                        >
                            <input type='file' id='file-upload' onChange={handleFileInput} accept='.pdf,.png,.jpg,.jpeg,.docx' multiple className='hidden' />
                            <label htmlFor='file-upload' className='cursor-pointer'>
                                <div className='flex flex-col items-center gap-2 sm:gap-3'>
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[#9AAF94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div className='text-sm sm:text-base'>
                                        <span className='text-[#6B9D63] font-medium hover:underline'>Click to Upload</span>
                                        <span className='text-[#7A8A73]'> or drag and drop</span>
                                    </div>
                                    <p className='text-xs sm:text-sm text-[#7A8A73]'>PDF, PNG, JPG, DOCX (Max 10MB)</p>
                                </div>
                            </label>
                        </div>

                        {existingAttachments.length > 0 && (
                            <div className='mt-3 sm:mt-4 space-y-2 w-full min-w-0 overflow-hidden'>
                                <p className="text-xs sm:text-sm font-medium text-[#577F4E]">Current Files:</p>
                                {existingAttachments.map((filePath, index) => (
                                    <div key={`existing-${index}`} className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 sm:p-3 bg-[#E8F0E5] rounded-lg border border-[#C7D9C1] min-w-0 overflow-hidden'>
                                        <p className='w-full min-w-0 max-w-full overflow-hidden text-xs sm:text-sm font-medium text-[#2C3E28] break-all sm:truncate'>{filePath.split('/').pop()}</p>
                                        <button onClick={() => handleRemoveExistingAttachment(filePath)} className='text-[#C85A5A] hover:text-[#A84848] transition-colors text-xs sm:text-sm font-medium shrink-0 sm:self-center'>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {attachments.length > 0 && (
                            <div className='mt-3 sm:mt-4 space-y-2 w-full min-w-0 overflow-hidden'>
                                <p className="text-xs sm:text-sm font-medium text-[#577F4E]">New Files to Upload:</p>
                                {attachments.map((file, index) => (
                                    <div key={`new-${index}`} className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 sm:p-3 bg-[#F5F7EF] rounded-lg border border-[#E3E8D9] min-w-0 overflow-hidden'>
                                        <p className='w-full min-w-0 max-w-full overflow-hidden text-xs sm:text-sm font-medium text-[#2C3E28] break-all sm:truncate'>{file.name}</p>
                                        <button onClick={() => handleRemoveNewAttachment(index)} className='text-[#C85A5A] hover:text-[#A84848] transition-colors text-xs sm:text-sm font-medium shrink-0 sm:self-center'>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- License Agreement --- */}
                    {attachments.length > 0 && (
                        <div className='mt-5 sm:mt-6 p-3 sm:p-4 bg-[#F5F7EF] rounded-lg border border-[#E3E8D9]'>
                            <label className='flex items-start gap-3 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    checked={licenseAgreement}
                                    onChange={(e) => setLicenseAgreement(e.target.checked)}
                                    className='mt-0.5 w-4 h-4 accent-[#6B9D63] cursor-pointer shrink-0'
                                />
                                <span className='text-xs sm:text-sm text-[#2C3E28]'>
                                    By uploading, I confirm I own these materials and agree to share them with the community, allowing other users to view, download, and use them for their studies.
                                </span>
                            </label>
                        </div>
                    )}

                </div>
            </div>

            {/* --- Cancel Modal --- */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 sm:p-6 border border-[#E3E8D9]">
                        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                            <svg className="w-5 h-5 text-[#C85A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-base sm:text-lg font-semibold text-[#2C3E28]">Discard Changes?</h3>
                        </div>
                        <p className="text-[#7A8A73] mb-4 sm:mb-6 text-center text-sm">
                            Are you sure you want to cancel? All unsaved changes will be lost forever.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2.5 border border-[#D4D9C6] text-[#577F4E] rounded-xl hover:bg-[#F5F7EF] transition-colors font-medium text-sm">
                                Keep Editing
                            </button>
                            <button onClick={handleConfirmCancel} className="flex-1 px-4 py-2.5 bg-[#C85A5A] text-white rounded-xl hover:bg-[#A84848] transition-colors font-medium text-sm">
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditContentPage;