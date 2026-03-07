import React, { useState, useEffect } from 'react';
import { api } from '../../util/api';
import { useProfileContext } from '../../context/ProfileContext';
import { useNavigate } from 'react-router-dom';

const AdminTerminalPage = () => {
    const { profileData } = useProfileContext();
    const navigate = useNavigate();

    const [sourceTags, setSourceTags] = useState([]); // Array of tags
    const [tagInput, setTagInput] = useState('');
    const [targetTag, setTargetTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [suggestions, setSuggestions] = useState([]);
    const [userInterests, setUserInterests] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showTargetSuggestions, setShowTargetSuggestions] = useState(false);
    const [targetSuggestions, setTargetSuggestions] = useState([]);

    const [deleteContentId, setDeleteContentId] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const [deleteCommentId, setDeleteCommentId] = useState('');
    const [deleteCommentParentId, setDeleteCommentParentId] = useState('');
    const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);
    const [deleteCommentMessage, setDeleteCommentMessage] = useState('');
    const [deleteCommentError, setDeleteCommentError] = useState('');

    const [createTagName, setCreateTagName] = useState('');
    const [createTagLoading, setCreateTagLoading] = useState(false);
    const [createTagMessage, setCreateTagMessage] = useState('');
    const [createTagError, setCreateTagError] = useState('');


    const [deleteTagName, setDeleteTagName] = useState('');
    const [deleteTagLoading, setDeleteTagLoading] = useState(false);
    const [deleteTagMessage, setDeleteTagMessage] = useState('');
    const [deleteTagError, setDeleteTagError] = useState('');
    const [deleteSuggestions, setDeleteSuggestions] = useState([]);
    const [showDeleteSuggestions, setShowDeleteSuggestions] = useState(false);

    const fetchTagsData = React.useCallback(async () => {
        try {
            const [allTagsRes, profileRes] = await Promise.all([
                api.get('/tags/all'),
                api.get('/users/me')
            ]);
            setPopularTags(allTagsRes.tags || []);
            setUserInterests(profileRes.interested_tags || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    }, []);

    useEffect(() => {
        if (profileData?.is_admin) {
            fetchTagsData();
        }
    }, [profileData, fetchTagsData]);

    useEffect(() => {
        if (tagInput.trim()) {
            const interestTagObjects = userInterests.map(name => {
                const found = popularTags.find(t => t.name === name);
                return found || { name, color: '#E8F0E5' };
            });

            const combined = [...popularTags];
            interestTagObjects.forEach(it => {
                if (!combined.find(t => t.name === it.name)) {
                    combined.push(it);
                }
            });

            const filtered = combined.filter(tag =>
                tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                !sourceTags.includes(tag.name)
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [tagInput, sourceTags, userInterests, popularTags]);

    useEffect(() => {
        if (targetTag.trim()) {
            const filtered = popularTags.filter(tag =>
                tag.name.toLowerCase().includes(targetTag.toLowerCase()) &&
                tag.name !== targetTag
            );
            setTargetSuggestions(filtered);
            setShowTargetSuggestions(filtered.length > 0);
        } else {
            setTargetSuggestions([]);
            setShowTargetSuggestions(false);
        }
    }, [targetTag, popularTags]);

    useEffect(() => {
        if (deleteTagName.trim()) {
            const filtered = popularTags.filter(tag =>
                tag.name.toLowerCase().includes(deleteTagName.toLowerCase()) &&
                tag.name !== deleteTagName
            );
            setDeleteSuggestions(filtered);
            setShowDeleteSuggestions(filtered.length > 0);
        } else {
            setDeleteSuggestions([]);
            setShowDeleteSuggestions(false);
        }
    }, [deleteTagName, popularTags]);

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !sourceTags.includes(trimmed)) {
            setSourceTags([...sourceTags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setSourceTags(sourceTags.filter(tag => tag !== tagToRemove));
    };

    if (!profileData || !profileData.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full bg-[#EEF2E1]">
                <h1 className="text-2xl font-bold text-red-600 font-['Inter']">Access Denied</h1>
                <p className="mt-2 text-[#3A5335] font-['Inter']">You must be an admin to view this page.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 bg-[#6B9D63] text-white rounded-full hover:bg-[#577F4E] font-['Inter'] transition-all"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const handleMergeTags = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await api.post('/tags/merge', {
                source_tags: sourceTags,
                target_tag: targetTag.trim()
            });
            setMessage(response.message || 'Tags merged successfully!');
            setSourceTags([]);
            setTargetTag('');
            fetchTagsData();
        } catch (err) {
            setError(err.message || 'An error occurred while merging tags.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContent = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Are you sure you want to delete content ID: ${deleteContentId}? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(true);
        setDeleteMessage('');
        setDeleteError('');

        try {
            const response = await api.delete(`/admin/content/${deleteContentId.trim()}`);
            setDeleteMessage(response.message || 'Content deleted successfully!');
            setDeleteContentId('');
        } catch (err) {
            setDeleteError(err.message || 'An error occurred while deleting content.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        setCreateTagLoading(true);
        setCreateTagMessage('');
        setCreateTagError('');

        try {
            const response = await api.post('/tags/', {
                name: createTagName.trim()
            });
            setCreateTagMessage(response.message || 'Tag created successfully!');
            setCreateTagName('');
            fetchTagsData();
        } catch (err) {
            setCreateTagError(err.message || 'An error occurred while creating the tag.');
        } finally {
            setCreateTagLoading(false);
        }
    };

    const handleDeleteTag = async (e) => {
        e.preventDefault();

        if (!window.confirm(`Are you sure you want to delete the tag '${deleteTagName}'? This will remove it from all usage and cannot be undone.`)) {
            return;
        }

        setDeleteTagLoading(true);
        setDeleteTagMessage('');
        setDeleteTagError('');

        try {
            // Encode the tag name in case it contains special characters like #
            const encodedTagName = encodeURIComponent(deleteTagName.trim());
            const response = await api.delete(`/tags/${encodedTagName}`);
            setDeleteTagMessage(response.message || 'Tag deleted successfully!');
            setDeleteTagName('');
            fetchTagsData();
        } catch (err) {
            setDeleteTagError(err.message || 'An error occurred while deleting the tag.');
        } finally {
            setDeleteTagLoading(false);
        }
    };

    const handleDeleteComment = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Are you sure you want to delete comment ID: ${deleteCommentId}? This action cannot be undone.`)) {
            return;
        }

        setDeleteCommentLoading(true);
        setDeleteCommentMessage('');
        setDeleteCommentError('');

        try {
            const response = await api.delete(`/admin/content/${deleteCommentParentId.trim()}/comment/${deleteCommentId.trim()}`);
            setDeleteCommentMessage(response.message || 'Comment deleted successfully!');
            setDeleteCommentId('');
            setDeleteCommentParentId('');
        } catch (err) {
            setDeleteCommentError(err.message || 'An error occurred while deleting comment.');
        } finally {
            setDeleteCommentLoading(false);
        }
    };


    return (
        <div className="flex flex-col items-center p-8 bg-[#EEF2E1] min-h-screen font-['Inter']">
            <div className="w-full max-w-6xl">
                {/* Tag Management Section */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#D4D9C6] pb-4">
                        <div className="p-2 bg-[#6B9D63] rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#3A5335]">Tag Management</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Create Tag Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E3E8D9] flex flex-col">
                            <h3 className="text-xl font-bold mb-2 text-[#3A5335]">Create New Tag</h3>
                            <p className="text-sm text-[#7A8A73] mb-6">Define new categorizeable labels for posts and discussions.</p>

                            {createTagMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm animate-fade-in">{createTagMessage}</div>}
                            {createTagError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm animate-fade-in">{createTagError}</div>}

                            <form onSubmit={handleCreateTag} className="flex flex-col gap-6 mt-auto">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-[#3A5335]">Tag Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Mathematics"
                                        className="w-full px-4 py-3 bg-[#F9FBF7] border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent text-[#2C3E28] transition-all"
                                        value={createTagName}
                                        onChange={(e) => setCreateTagName(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createTagLoading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-md ${createTagLoading ? 'bg-[#9AAF94] cursor-not-allowed' : 'bg-[#6B9D63] hover:bg-[#577F4E] hover:shadow-lg'}`}
                                >
                                    {createTagLoading ? 'Processing...' : 'Add to System'}
                                </button>
                            </form>
                        </div>

                        {/* Delete Tag Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E3E8D9] flex flex-col">
                            <h3 className="text-xl font-bold mb-2 text-[#C85A5A]">Delete Tag</h3>
                            <p className="text-sm text-[#7A8A73] mb-6">Permanently remove a tag. This action is irreversible and affects all content.</p>

                            {deleteTagMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm">{deleteTagMessage}</div>}
                            {deleteTagError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">{deleteTagError}</div>}

                            <form onSubmit={handleDeleteTag} className="flex flex-col gap-6 mt-auto">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-[#3A5335]">Identify Tag</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search tag to remove..."
                                            className="w-full px-4 py-3 bg-[#F9FBF7] border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85A5A] focus:border-transparent text-[#2C3E28] transition-all"
                                            value={deleteTagName}
                                            onChange={(e) => setDeleteTagName(e.target.value)}
                                            onFocus={() => deleteTagName.trim() && deleteSuggestions.length > 0 && setShowDeleteSuggestions(true)}
                                            required
                                        />
                                        {showDeleteSuggestions && (
                                            <div className="absolute z-10 mt-2 w-full bg-white border border-[#D4D9C6] rounded-xl shadow-xl overflow-hidden max-h-[150px] overflow-y-auto ring-1 ring-black ring-opacity-5">
                                                {deleteSuggestions.slice(0, 5).map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setDeleteTagName(suggestion.name || suggestion);
                                                            setShowDeleteSuggestions(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors border-b border-[#F0F2EA] last:border-0 flex items-center justify-between"
                                                    >
                                                        <span>{suggestion.name || suggestion}</span>
                                                        <span className="text-xs font-medium text-[#7A8A73] bg-[#EEF2E1] px-2 py-0.5 rounded-full">{suggestion.use_count || 0}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={deleteTagLoading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-md ${deleteTagLoading ? 'bg-[#9AAF94] cursor-not-allowed' : 'bg-[#C85A5A] hover:bg-[#A84848] hover:shadow-lg'}`}
                                >
                                    {deleteTagLoading ? 'Removing...' : 'Delete Permanently'}
                                </button>
                            </form>
                        </div>

                        {/* Merge Tags Card - Full Width in Grid */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E3E8D9] lg:col-span-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-[#3A5335]">Merge & Consolidate Tags</h3>
                                    <p className="text-sm text-[#7A8A73]">Combine multiple legacy tags into a unified target tag.</p>
                                </div>
                            </div>

                            {message && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">{message}</div>}
                            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">{error}</div>}

                            <form onSubmit={handleMergeTags} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-[#3A5335]">Source Tags (to be removed)</label>
                                    <div className="relative">
                                        <div className="min-h-[120px] w-full p-4 bg-[#F9FBF7] border border-[#D4D9C6] rounded-xl flex flex-wrap gap-2 content-start focus-within:ring-2 focus-within:ring-[#6B9D63] focus-within:border-transparent transition-all">
                                            {sourceTags.map((tag, index) => (
                                                <span key={index} className="bg-white text-[#577F4E] px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 border border-[#E3E8D9] shadow-sm animate-pop-in">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="text-[#9AAF94] hover:text-[#C85A5A] transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder={sourceTags.length === 0 ? "Search tags to merge..." : "Add more..."}
                                                className="flex-1 min-w-[120px] bg-transparent outline-none border-none py-1 text-sm text-[#2C3E28] placeholder:text-[#9AAF94]"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTag();
                                                    }
                                                }}
                                                onFocus={() => tagInput.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                                            />
                                        </div>

                                        {showSuggestions && (
                                            <div className="absolute z-20 mt-2 w-full bg-white border border-[#D4D9C6] rounded-xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto ring-1 ring-black ring-opacity-5">
                                                {suggestions.slice(0, 8).map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            if (!sourceTags.includes(suggestion.name || suggestion)) {
                                                                setSourceTags([...sourceTags, suggestion.name || suggestion]);
                                                            }
                                                            setTagInput('');
                                                            setShowSuggestions(false);
                                                        }}
                                                        className="w-full text-left px-5 py-3 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors flex items-center justify-between border-b border-[#F0F2EA] last:border-0"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: suggestion.color || '#6B9D63' }}></div>
                                                            <span className="font-medium">{suggestion.name || suggestion}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-[#7A8A73] bg-[#EEF2E1] px-2 py-1 rounded-md">{suggestion.use_count || 0} usage</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between space-y-4">
                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-[#3A5335]">Target Tag (the result)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter destination tag name..."
                                                className="w-full px-4 py-3 bg-[#F9FBF7] border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent text-[#2C3E28] transition-all"
                                                value={targetTag}
                                                onChange={(e) => setTargetTag(e.target.value)}
                                                onFocus={() => targetTag.trim() && targetSuggestions.length > 0 && setShowTargetSuggestions(true)}
                                                required
                                            />
                                            {showTargetSuggestions && (
                                                <div className="absolute z-10 mt-2 w-full bg-white border border-[#D4D9C6] rounded-xl shadow-xl overflow-hidden max-h-[150px] overflow-y-auto">
                                                    {targetSuggestions.slice(0, 5).map((suggestion, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setTargetTag(suggestion.name || suggestion);
                                                                setShowTargetSuggestions(false);
                                                            }}
                                                            className="w-full text-left px-5 py-3 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors border-b border-[#F0F2EA] last:border-0 font-medium"
                                                        >
                                                            {suggestion.name || suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || sourceTags.length === 0}
                                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-lg ${loading || sourceTags.length === 0 ? 'bg-[#9AAF94] cursor-not-allowed shadow-none' : 'bg-[#6B9D63] hover:bg-[#577F4E]'}`}
                                    >
                                        {loading ? 'Merging Data...' : `Merge ${sourceTags.length} Tag${sourceTags.length !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E3E8D9] lg:col-span-2 mt-8">
                        <h3 className="text-xl font-bold mb-2 text-[#3A5335]">All Tags</h3>
                        <p className="text-sm text-[#7A8A73] mb-6">All tags in the system sorted alphabetically.</p>
                        <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-scroll">
                            {[...popularTags].sort((a, b) => (a.name || a).localeCompare(b.name || b)).map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border shadow-sm"
                                    style={{
                                        backgroundColor: tag.color || '#E8F0E5',
                                        borderColor: tag.color || '#D4D9C6',
                                        color: '#2C3E28'
                                    }}
                                >
                                    {tag.name || tag}
                                    <span className="text-xs font-bold opacity-70">{tag.use_count || 0}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content Moderation Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8 border-b border-[#D4D9C6] pb-4">
                        <div className="p-2 bg-[#C85A5A] rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#3A5335]">Content Moderation</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Delete Content Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E3E8D9] flex flex-col">
                            <h3 className="text-xl font-bold mb-2 text-[#3A5335]">Remove Post/Discussion</h3>
                            <p className="text-sm text-[#7A8A73] mb-6">Purge any primary content using its specific Identifier.</p>

                            {deleteMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm">{deleteMessage}</div>}
                            {deleteError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">{deleteError}</div>}

                            <form onSubmit={handleDeleteContent} className="flex flex-col gap-6 mt-auto">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-[#3A5335]">Content ID</label>
                                    <input
                                        type="text"
                                        placeholder="Paste ID here..."
                                        className="w-full px-4 py-3 bg-[#F9FBF7] border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent text-[#2C3E28] transition-all"
                                        value={deleteContentId}
                                        onChange={(e) => setDeleteContentId(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={deleteLoading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-md ${deleteLoading ? 'bg-[#9AAF94] cursor-not-allowed' : 'bg-[#C85A5A] hover:bg-[#A84848] hover:shadow-lg'}`}
                                >
                                    {deleteLoading ? 'Processing...' : 'Delete Content'}
                                </button>
                            </form>
                        </div>

                        {/* Delete Comment Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E3E8D9] flex flex-col">
                            <h3 className="text-xl font-bold mb-2 text-[#3A5335]">Remove Comment</h3>
                            <p className="text-sm text-[#7A8A73] mb-6">Delete specific feedback or responses from a parent post.</p>

                            {deleteCommentMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm">{deleteCommentMessage}</div>}
                            {deleteCommentError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">{deleteCommentError}</div>}

                            <form onSubmit={handleDeleteComment} className="flex flex-col gap-6 mt-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-[#3A5335]">Parent ID</label>
                                        <input
                                            type="text"
                                            placeholder="..."
                                            className="w-full px-4 py-3 bg-[#F9FBF7] border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent text-[#2C3E28] transition-all"
                                            value={deleteCommentParentId}
                                            onChange={(e) => setDeleteCommentParentId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-[#3A5335]">Comment ID</label>
                                        <input
                                            type="text"
                                            placeholder="..."
                                            className="w-full px-4 py-3 bg-[#F9FBF7] border border-[#D4D9C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent text-[#2C3E28] transition-all"
                                            value={deleteCommentId}
                                            onChange={(e) => setDeleteCommentId(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={deleteCommentLoading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-md ${deleteCommentLoading ? 'bg-[#9AAF94] cursor-not-allowed' : 'bg-[#C85A5A] hover:bg-[#A84848] hover:shadow-lg'}`}
                                >
                                    {deleteCommentLoading ? 'Removing...' : 'Delete Comment'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminTerminalPage;
