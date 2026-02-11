import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Save, X, User as UserIcon, Calendar, FileText, MessageSquare } from 'lucide-react';
import API_BASE_URL from '../config';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [saving, setSaving] = useState(false);

    // Interests state
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [savingInterests, setSavingInterests] = useState(false);
    const [customTagInput, setCustomTagInput] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'karma', 'followers', 'following', 'posts', 'discussions'
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch current user
                const meRes = await fetch(`${API_BASE_URL}/users/me`, { credentials: 'include' });
                if (meRes.ok) {
                    const meData = await meRes.json();
                    setCurrentUser(meData);
                } else {
                    navigate('/login');
                    return;
                }

                // Fetch profile user
                const userRes = await fetch(`${API_BASE_URL}/users/${id}`, { credentials: 'include' });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setProfileUser(userData);
                    setBio(userData.bio || '');
                    setSelectedInterests(userData.interested_tags || []);
                } else {
                    console.error("Failed to fetch profile user");
                }
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Fetch available tags for interests editing
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/tags/popular`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableTags(data.tags || []);
                }
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };

        fetchTags();
    }, []);

    const handleSaveBio = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users/me/bio`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio }),
                credentials: 'include'
            });

            if (response.ok) {
                setProfileUser({ ...profileUser, bio });
                setIsEditing(false);
            } else {
                alert("Failed to update bio");
            }
        } catch (error) {
            console.error("Error updating bio", error);
        } finally {
            setSaving(false);
        }
    };

    const toggleInterest = (tag) => {
        if (selectedInterests.includes(tag)) {
            setSelectedInterests(selectedInterests.filter(t => t !== tag));
        } else {
            setSelectedInterests([...selectedInterests, tag]);
        }
    };

    const handleAddCustomTag = () => {
        const trimmedTag = customTagInput.trim();
        if (trimmedTag && !selectedInterests.includes(trimmedTag)) {
            setSelectedInterests([...selectedInterests, trimmedTag]);
            // Also add to available tags if not already there
            if (!availableTags.includes(trimmedTag)) {
                setAvailableTags([...availableTags, trimmedTag]);
            }
            setCustomTagInput('');
        }
    };

    const handleCustomTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustomTag();
        }
    };

    const handleSaveInterests = async () => {
        setSavingInterests(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users/me/interests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: selectedInterests }),
                credentials: 'include'
            });

            if (response.ok) {
                setProfileUser({ ...profileUser, interested_tags: selectedInterests });
                setIsEditingInterests(false);
            } else {
                alert("Failed to update interests");
            }
        } catch (error) {
            console.error("Error updating interests", error);
        } finally {
            setSavingInterests(false);
        }
    };

    const handleStatClick = async (type) => {
        setModalType(type);
        setModalOpen(true);
        setModalLoading(true);

        try {
            if (type === 'karma') {
                // No API call needed, just show breakdown
                setModalData([
                    { label: 'Post Karma', value: profileUser.post_karma || 0 },
                    { label: 'Discussion Karma', value: profileUser.discussion_karma || 0 },
                    { label: 'Comment Karma', value: profileUser.comment_karma || 0 }
                ]);
                setModalLoading(false);
            } else if (type === 'followers') {
                const response = await fetch(`${API_BASE_URL}/users/${id}/followers`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setModalData(data.data);
                }
                setModalLoading(false);
            } else if (type === 'following') {
                const response = await fetch(`${API_BASE_URL}/users/${id}/following`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setModalData(data.data);
                }
                setModalLoading(false);
            } else if (type === 'posts') {
                const response = await fetch(`${API_BASE_URL}/users/${id}/posts`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setModalData(data.data);
                }
                setModalLoading(false);
            } else if (type === 'discussions') {
                const response = await fetch(`${API_BASE_URL}/users/${id}/discussions`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setModalData(data.data);
                }
                setModalLoading(false);
            }
        } catch (error) {
            console.error('Error fetching modal data:', error);
            setModalLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!profileUser || !currentUser) return null;

    const isOwnProfile = currentUser.google_id === profileUser.google_id;
    const totalKarma = (profileUser.post_karma || 0) + (profileUser.discussion_karma || 0) + (profileUser.comment_karma || 0);

    const formatDate = (dateString) => {
        if (!dateString) return 'Member';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="app-container">
            <Sidebar user={currentUser} />
            <main className="main-content">
                <header className="page-header">
                    <h1>Profile</h1>
                </header>

                <div className="profile-container">
                    <div className="profile-card">
                        <div className="profile-header">
                            <img
                                src={profileUser.profile_picture_url}
                                alt={profileUser.username}
                                className="profile-large-pic"
                            />
                            <div className="profile-main-info">
                                <h2>{profileUser.username}</h2>
                                <p className="profile-email">{profileUser.email}</p>
                                <div className="profile-joined">
                                    <Calendar size={14} />
                                    <span>Joined {formatDate(profileUser.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-stats">
                            <div className="stat-item clickable" onClick={() => handleStatClick('karma')}>
                                <span className="stat-value">{totalKarma}</span>
                                <span className="stat-label">Karma</span>
                            </div>
                            <div className="stat-item clickable" onClick={() => handleStatClick('followers')}>
                                <span className="stat-value">{profileUser.follower_ids?.length || 0}</span>
                                <span className="stat-label">Followers</span>
                            </div>
                            <div className="stat-item clickable" onClick={() => handleStatClick('following')}>
                                <span className="stat-value">{profileUser.following_ids?.length || 0}</span>
                                <span className="stat-label">Following</span>
                            </div>
                            <div className="stat-item clickable" onClick={() => handleStatClick('posts')}>
                                <span className="stat-value">{profileUser.uploaded_doc_ids?.length || 0}</span>
                                <span className="stat-label">Posts</span>
                            </div>
                            <div className="stat-item clickable" onClick={() => handleStatClick('discussions')}>
                                <span className="stat-value">{profileUser.discussion_ids?.length || 0}</span>
                                <span className="stat-label">Discussions</span>
                            </div>
                        </div>

                        <div className="profile-bio-section">
                            <div className="section-header">
                                <h3>Bio</h3>
                                {isOwnProfile && !isEditing && (
                                    <button className="edit-section-btn" onClick={() => setIsEditing(true)}>
                                        <Edit2 size={16} /> Edit
                                    </button>
                                )}
                            </div>
                            {isEditing ? (
                                <div className="bio-edit-container">
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        className="bio-textarea"
                                        maxLength={200}
                                    />
                                    <div className="bio-edit-actions">
                                        <button
                                            className="save-btn"
                                            onClick={handleSaveBio}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : <><Save size={16} /> Save</>}
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setBio(profileUser.bio || '');
                                            }}
                                            disabled={saving}
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="bio-text">
                                    {profileUser.bio || "No bio yet."}
                                </p>
                            )}
                        </div>

                        <div className="profile-interests-section">
                            <div className="section-header">
                                <h3>Interests</h3>
                                {isOwnProfile && !isEditingInterests && (
                                    <button className="edit-section-btn" onClick={() => setIsEditingInterests(true)}>
                                        <Edit2 size={16} /> Edit
                                    </button>
                                )}
                            </div>
                            {isEditingInterests ? (
                                <div className="interests-edit-container">
                                    <div className="custom-tag-input-container">
                                        <input
                                            type="text"
                                            value={customTagInput}
                                            onChange={(e) => setCustomTagInput(e.target.value)}
                                            onKeyPress={handleCustomTagKeyPress}
                                            placeholder="Add a custom tag..."
                                            className="custom-tag-input"
                                            maxLength={30}
                                        />
                                        <button
                                            className="add-tag-btn"
                                            onClick={handleAddCustomTag}
                                            disabled={!customTagInput.trim()}
                                        >
                                            Add Tag
                                        </button>
                                    </div>
                                    <div className="interests-edit-grid">
                                        {availableTags.map(tag => (
                                            <div
                                                key={tag}
                                                className={`interest-chip ${selectedInterests.includes(tag) ? 'selected' : ''}`}
                                                onClick={() => toggleInterest(tag)}
                                            >
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bio-edit-actions">
                                        <button
                                            className="save-btn"
                                            onClick={handleSaveInterests}
                                            disabled={savingInterests}
                                        >
                                            {savingInterests ? 'Saving...' : <><Save size={16} /> Save</>}
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => {
                                                setIsEditingInterests(false);
                                                setSelectedInterests(profileUser.interested_tags || []);
                                                setCustomTagInput('');
                                            }}
                                            disabled={savingInterests}
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="interests-display">
                                    {profileUser.interested_tags && profileUser.interested_tags.length > 0 ? (
                                        profileUser.interested_tags.map(tag => (
                                            <span key={tag} className="interest-chip">{tag}</span>
                                        ))
                                    ) : (
                                        <p className="bio-text">No interests selected yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Modal */}
                {modalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{modalType?.charAt(0).toUpperCase() + modalType?.slice(1)}</h2>
                                <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {modalLoading ? (
                                    <div className="modal-loading">Loading...</div>
                                ) : (
                                    <>
                                        {modalType === 'karma' && (
                                            <div className="karma-breakdown">
                                                {modalData.map((item, index) => (
                                                    <div key={index} className="karma-item">
                                                        <span className="karma-label">{item.label}</span>
                                                        <span className="karma-value">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {(modalType === 'followers' || modalType === 'following') && (
                                            <div className="users-list">
                                                {modalData.length > 0 ? (
                                                    modalData.map((user) => (
                                                        <div
                                                            key={user.google_id}
                                                            className="user-list-item"
                                                            onClick={() => {
                                                                setModalOpen(false);
                                                                navigate(`/profile/${user.google_id}`);
                                                            }}
                                                        >
                                                            <img src={user.profile_picture_url} alt={user.username} className="user-list-avatar" />
                                                            <div className="user-list-info">
                                                                <div className="user-list-name">{user.username}</div>
                                                                <div className="user-list-bio">{user.bio || 'No bio'}</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="empty-list">No {modalType} yet</div>
                                                )}
                                            </div>
                                        )}
                                        {(modalType === 'posts' || modalType === 'discussions') && (
                                            <div className="content-list">
                                                {modalData.length > 0 ? (
                                                    modalData.map((item) => (
                                                        <div
                                                            key={item._id}
                                                            className="content-list-item"
                                                            onClick={() => {
                                                                setModalOpen(false);
                                                                navigate(`/post/${item._id}`);
                                                            }}
                                                        >
                                                            <h4 className="content-list-title">{item.title}</h4>
                                                            <p className="content-list-snippet">
                                                                {item.text?.substring(0, 100)}{item.text?.length > 100 ? '...' : ''}
                                                            </p>
                                                            <div className="content-list-meta">
                                                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                                <span>❤️ {item.liked_by_user_ids?.length || 0}</span>
                                                                <span>💬 {item.comment_ids?.length || 0}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="empty-list">No {modalType} yet</div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <RightPanel />
        </div>
    );
};

export default Profile;
