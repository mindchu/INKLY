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
    const hasFetched = React.useRef(false);

    useEffect(() => {
        const fetchTagsData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            try {
                const [allTagsRes, profileRes] = await Promise.all([
                    api.get('/tags/all'),
                    api.get('/users/me')
                ]);
                setPopularTags(allTagsRes.tags || []);
                setUserInterests(profileRes.interested_tags || []);
            } catch (error) {
                console.error('Error fetching tags:', error);
                hasFetched.current = false;
            }
        };
        if (profileData?.is_admin) {
            fetchTagsData();
        } else {
            hasFetched.current = false;
        }
    }, [profileData]);

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
        <div className="flex flex-col items-center p-8 bg-[#EEF2E1] min-h-full font-['Inter']">
            <div className="w-full max-w-2xl bg-white rounded-lg p-8 shadow-sm border border-[#E3E8D9] mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#3A5335]">Merge Tags</h2>
                <p className="text-sm text-[#7A8A73] mb-6">
                    Combine multiple existing tags into a single target tag. This will update all posts, discussions, and user interests. The source tags will be deleted.
                </p>

                {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <form onSubmit={handleMergeTags} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[#3A5335] mb-2">Source Tags (Select multiple to merge)</label>
                        <div className="relative">
                            <div className="min-h-[46px] w-full p-2 bg-white border border-[#D4D9C6] rounded-md flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-[#6B9D63] transition-all">
                                {sourceTags.map((tag, index) => (
                                    <span key={index} className="bg-[#E8F0E5] text-[#577F4E] px-3 py-1 rounded-full text-sm inline-flex items-center gap-2 border border-[#C7D9C1]">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-red-500 font-bold"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    placeholder={sourceTags.length === 0 ? "Search or type tags to merge..." : ""}
                                    className="flex-1 min-w-[150px] bg-transparent outline-none border-none py-1 text-sm text-[#2C3E28] placeholder:text-[#9AAF94] h-full"
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
                                <div className="absolute z-10 mt-1 w-full bg-white border border-[#D4D9C6] rounded-md shadow-lg overflow-hidden max-h-[200px] overflow-y-auto">
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
                                            className="w-full text-left px-4 py-2 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors flex items-center justify-between border-b border-[#F0F2EA] last:border-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                {suggestion.color && (
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: suggestion.color }}></div>
                                                )}
                                                <span>{suggestion.name || suggestion}</span>
                                            </div>
                                            <span className="text-xs text-[#7A8A73]">({suggestion.use_count || 0})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#3A5335] mb-2">Target Tag</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="e.g., #Cat"
                                className="w-full px-4 py-2 bg-white border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] text-[#2C3E28] placeholder:text-[#9AAF94]"
                                value={targetTag}
                                onChange={(e) => setTargetTag(e.target.value)}
                                onFocus={() => targetTag.trim() && targetSuggestions.length > 0 && setShowTargetSuggestions(true)}
                                required
                            />
                            {showTargetSuggestions && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-[#D4D9C6] rounded-md shadow-lg overflow-hidden max-h-[150px] overflow-y-auto">
                                    {targetSuggestions.slice(0, 5).map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setTargetTag(suggestion.name || suggestion);
                                                setShowTargetSuggestions(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors border-b border-[#F0F2EA] last:border-0"
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
                        disabled={loading}
                        className={`w-full py-3 rounded-full font-bold text-white transition-all transform hover:scale-[1.02] ${loading ? 'bg-[#9AAF94]' : 'bg-[#6B9D63] hover:bg-[#577F4E]'
                            }`}
                    >
                        {loading ? 'Merging...' : 'Merge Tags'}
                    </button>
                </form>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-lg p-8 shadow-sm border border-[#E3E8D9] mb-8 font-['Inter']">
                <h2 className="text-xl font-semibold mb-4 text-[#3A5335]">Delete Content</h2>
                <p className="text-sm text-[#7A8A73] mb-6">
                    Permanently delete any post or discussion by its ID. This is intended for removing inappropriate content. All associated comments will also be deleted.
                </p>

                {deleteMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{deleteMessage}</div>}
                {deleteError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{deleteError}</div>}

                <form onSubmit={handleDeleteContent} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[#3A5335] mb-1">Content ID</label>
                        <input
                            type="text"
                            placeholder="Enter the ID of the post or discussion..."
                            className="w-full px-4 py-2 bg-white border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] text-[#2C3E28] placeholder:text-[#9AAF94]"
                            value={deleteContentId}
                            onChange={(e) => setDeleteContentId(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={deleteLoading}
                        className={`w-full py-3 rounded-full font-bold text-white transition-all transform hover:scale-[1.02] ${deleteLoading ? 'bg-[#9AAF94]' : 'bg-[#C85A5A] hover:bg-[#A84848]'
                            }`}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete Content'}
                    </button>
                </form>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-lg p-8 shadow-sm border border-[#E3E8D9] mb-8 font-['Inter']">
                <h2 className="text-xl font-semibold mb-4 text-[#3A5335]">Delete Comment</h2>
                <p className="text-sm text-[#7A8A73] mb-6">
                    Permanently delete any comment by its ID.
                </p>

                {deleteCommentMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{deleteCommentMessage}</div>}
                {deleteCommentError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{deleteCommentError}</div>}

                <form onSubmit={handleDeleteComment} className="flex flex-col gap-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[#3A5335] mb-1">Parent Content ID</label>
                            <input
                                type="text"
                                placeholder="..."
                                className="w-full px-4 py-2 bg-white border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] text-[#2C3E28] placeholder:text-[#9AAF94]"
                                value={deleteCommentParentId}
                                onChange={(e) => setDeleteCommentParentId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[#3A5335] mb-1">Comment ID</label>
                            <input
                                type="text"
                                placeholder="..."
                                className="w-full px-4 py-2 bg-white border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] text-[#2C3E28] placeholder:text-[#9AAF94]"
                                value={deleteCommentId}
                                onChange={(e) => setDeleteCommentId(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={deleteCommentLoading}
                        className={`w-full py-3 rounded-full font-bold text-white transition-all transform hover:scale-[1.02] ${deleteCommentLoading ? 'bg-[#9AAF94]' : 'bg-[#C85A5A] hover:bg-[#A84848]'
                            }`}
                    >
                        {deleteCommentLoading ? 'Deleting...' : 'Delete Comment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminTerminalPage;
