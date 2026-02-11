import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Assuming we can use global styles or add specific ones here

const SelectInterests = () => {
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(`${API_URL}/tags/popular`);
                if (!response.ok) {
                    throw new Error('Failed to fetch tags');
                }
                const data = await response.json();
                setTags(data.tags);
            } catch (err) {
                console.error("Error fetching tags:", err);
                setError("Could not load tags. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, [API_URL]);

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${API_URL}/users/me/interests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ tags: selectedTags }),
            });

            if (response.ok) {
                navigate('/');
            } else {
                console.error("Failed to update interests");
                // Handle error (maybe show a toast)
            }
        } catch (err) {
            console.error("Error updating interests:", err);
        }
    };

    if (loading) return <div className="loading-container">Loading tags...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="select-interests-container">
            <h1>Select Your Interests</h1>
            <p className="subtitle">Pick topics you'd like to see more of.</p>

            <div className="tags-grid">
                {tags.map(tag => (
                    <div
                        key={tag}
                        className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                    </div>
                ))}
            </div>

            <div className="actions">
                <button className="continue-btn" onClick={handleSubmit} disabled={selectedTags.length === 0}>
                    Continue
                </button>
                <button className="skip-btn" onClick={() => navigate('/')}>
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default SelectInterests;
