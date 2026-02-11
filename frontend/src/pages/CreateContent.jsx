import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import '../App.css';

const CreateContent = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [type, setType] = useState('post'); // 'post' or 'discussion'
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/tags/popular`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableTags(data.tags);
                }
            } catch (err) {
                console.error("Failed to fetch tags", err);
            }
        };
        fetchTags();

        // Click outside listener
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const addTag = (tag) => {
        const newTag = tag.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setTagInput('');
            setShowSuggestions(false);
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(tagInput);
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const filteredTags = availableTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('text', text);
            formData.append('type', type);

            tags.forEach(tag => {
                formData.append('tags', tag);
            });

            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch(`${API_BASE_URL}/content`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/');
            } else {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to create content');
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-content-container">
            <h1>Create New {type === 'post' ? 'Post' : 'Discussion'}</h1>

            <div className="type-toggle">
                <button
                    className={`toggle-btn ${type === 'post' ? 'active' : ''}`}
                    onClick={() => setType('post')}
                    type="button"
                >
                    Post
                </button>
                <button
                    className={`toggle-btn ${type === 'discussion' ? 'active' : ''}`}
                    onClick={() => setType('discussion')}
                    type="button"
                >
                    Discussion
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a descriptive title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="text">Content</label>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={type === 'post' ? "Write your post content here..." : "Start your discussion..."}
                        rows={10}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Tags</label>
                    <div className="tags-input-container" ref={wrapperRef}>
                        <div className="tags-list">
                            {tags.map((tag, index) => (
                                <span key={index} className="tag-pill">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="remove-tag">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="tag-input-wrapper" style={{ position: 'relative', flexGrow: 1 }}>
                            <input
                                type="text"
                                id="tags"
                                value={tagInput}
                                onChange={(e) => {
                                    setTagInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Add tags..."
                                className="tag-input"
                                autoComplete="off"
                            />
                            {showSuggestions && tagInput && filteredTags.length > 0 && (
                                <ul className="tags-dropdown">
                                    {filteredTags.map(tag => (
                                        <li key={tag} onClick={() => addTag(tag)}>
                                            {tag}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="files">Attachments (Optional)</label>
                    <input
                        type="file"
                        id="files"
                        multiple
                        onChange={handleFileChange}
                        className="file-input"
                    />
                    {files.length > 0 && (
                        <ul className="file-list">
                            {Array.from(files).map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/')} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateContent;
