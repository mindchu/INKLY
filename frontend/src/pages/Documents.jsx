import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import Feed from '../components/Feed';

const Documents = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/me`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>;

    if (!user) return null;

    return <Feed title="Documents" type="post" user={user} />;
};

export default Documents;
