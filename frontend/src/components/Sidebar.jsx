import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, PlusSquare, LogOut, FileText, MessageSquare, User as UserIcon } from 'lucide-react';
import API_BASE_URL from '../config';

const Sidebar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        window.location.href = `${API_BASE_URL}/logout`;
    };

    if (!user) return null;

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Documents', path: '/documents', icon: FileText },
        { name: 'Discussions', path: '/discussions', icon: MessageSquare },
        { name: 'Create', path: '/create', icon: PlusSquare },
        { name: 'Profile', path: `/profile/${user.google_id}`, icon: UserIcon },
    ];

    return (
        <div className="sidebar">
            <Link to={`/profile/${user.google_id}`} className="user-profile">
                <img
                    src={user.profile_picture_url}
                    alt={user.username}
                    className="profile-pic"
                />
                <div className="user-info">
                    <h3 className="username">{user.username}</h3>
                    <p className="email">{user.email}</p>
                </div>
            </Link>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </button>
                ))}
                <button onClick={handleLogout} className="nav-item logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
