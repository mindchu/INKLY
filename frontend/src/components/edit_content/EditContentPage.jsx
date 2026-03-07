import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../util/api';
import { useProfileContext } from '../../context/ProfileContext';

const EditContentPage = () => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const { profileData } = useProfileContext();
    const [noteTitle, setNoteTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

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
                }
            } catch (error) {
                console.error('Failed to fetch content details:', error);
                alert('Failed to load content for editing.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        if (profileData) {
            fetchContent();
        }
    }, [contentId, navigate, profileData]);

    const handleSave = async () => {
        if (!noteTitle.trim() || !content.trim()) {
            alert('Please fill in both title and content fields.');
            return;
        }

        setSaving(true);
        try {
            const response = await api.put(`/content/${contentId}`, {
                title: noteTitle,
                text: content
            });

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

    const handleCancel = () => {
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        setShowCancelModal(false);
        navigate(-1);
    };

    useEffect(() => {
        window.handleSaveContent = handleSave;
        window.handleCancelEdit = handleCancel;
        return () => {
            delete window.handleSaveContent;
            delete window.handleCancelEdit;
        };
    }, [noteTitle, content]);

    if (loading) {
        return <div className='w-full h-screen bg-[#EEF2E1] flex items-center justify-center font-["Inter"]'>
            <div className='text-lg font-medium text-gray-600 animate-pulse'>Loading content...</div>
        </div>;
    }

    return (
        <div className='w-full min-h-screen bg-[#EEF2E1] overflow-auto font-["Inter"]'>
            <div className='max-w-5xl mx-auto p-8'>
                <div className='bg-white rounded-lg shadow-sm border border-[#E3E8D9] p-8'>

                    <div className='mb-6'>
                        <label className='block text-sm font-medium text-[#3A5335] mb-2'>
                            Content Title <span className='text-[#C85A5A]'>*</span>
                        </label>
                        <input
                            type='text'
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder='Enter title...'
                            className='w-full px-4 py-3 border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all text-[#2C3E28] placeholder:text-[#9AAF94]'
                        />
                    </div>

                    <div className='mb-6'>
                        <label className='block text-sm font-medium text-[#3A5335] mb-2'>
                            Content <span className='text-[#C85A5A]'>*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder='Write your content here...'
                            className='w-full px-4 py-3 border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all resize-none h-64 text-[#2C3E28] placeholder:text-[#9AAF94]'
                        />
                        <p className='text-sm text-[#7A8A73] mt-2'>
                            {content.length} characters
                        </p>
                    </div>

                    <div className='p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200'>
                        <strong>Note:</strong> You can only edit the title and text of your content. To update tags or attachments, please delete and create a new post.
                    </div>

                </div>
            </div>
            {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-[#E3E8D9]">
                <div className="flex items-center text-center justify-center gap-3 mb-4 text-[#C85A5A]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-[#2C3E28]">Discard Changes?</h3>
                </div>
                
                <p className="text-[#7A8A73] mb-6 text-center">
                    Are you sure you want to cancel? All unsaved changes will be lost forever.
                </p>

                <div className="flex gap-3">
                    <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 border border-[#D4D9C6] text-[#577F4E] rounded-md hover:bg-[#F5F7EF] transition-colors font-medium"
                    >
                    Keep Editing
                    </button>
                    <button
                    onClick={handleConfirmCancel}
                    className="flex-1 px-4 py-2 bg-[#C85A5A] text-white rounded-md hover:bg-[#A84848] transition-colors font-medium shadow-sm"
                    >
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
