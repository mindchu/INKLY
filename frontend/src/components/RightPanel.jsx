import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const RightPanel = ({ selectedTags = [], setSelectedTags }) => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/tags/popular`);
                if (response.ok) {
                    const data = await response.json();
                    setTags(data.tags);
                }
            } catch (error) {
                console.error("Failed to fetch popular tags", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    const toggleTag = (tag) => {
        if (!setSelectedTags) {
            // Navigate to home with this tag selected
            navigate(`/?tag=${tag}`);
            return;
        }

        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    return (
        <div className="right-panel">
            <div className="panel-header">
                <h3>Popular Tags</h3>
            </div>

            <div className="tags-panel-list">
                {loading ? (
                    <p>Loading tags...</p>
                ) : tags.length > 0 ? (
                    tags.map(tag => {
                        const isActive = selectedTags.includes(tag);
                        const isSomethingSelected = selectedTags.length > 0;

                        return (
                            <div
                                key={tag}
                                className={`panel-tag-chip ${isActive ? 'active' : ''} ${isSomethingSelected && !isActive ? 'inactive' : ''}`}
                                onClick={() => toggleTag(tag)}
                            >
                                #{tag}
                            </div>
                        );
                    })
                ) : (
                    <p>No tags available.</p>
                )}
            </div>
        </div>
    );
};

export default RightPanel;
