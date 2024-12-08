import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserDashboard() {
    const [userInfo, setUserInfo] = useState({ username: '', email: '',  resume_path: '', id: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => 
    {
        const fetchUserInfo = async () => 
    {
            const user = JSON.parse(localStorage.getItem('user'));
            const email = user ? user.email : null;

            if (!email) {
                console.error('User not logged in');
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/api/user/info/email`, { params: { email } });
                setUserInfo(response.data);
            } catch (error) {
                console.error('Error fetching user info:', error);
                setError('Failed to fetch user information. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleViewProfile = () => {
        navigate('/profile', { state: { userId: userInfo.id } });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div> {/* Add a spinner or loader here */}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar onLogout={handleLogout} />
            <ToastContainer />
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div>
                    <h2 className="text-2xl font-bold mb-4">User Information</h2>
                    <p className="text-gray-700 mb-2"><strong>UserName:</strong> {userInfo.username}</p>
                    <p className="text-gray-700 mb-2"><strong>Email:</strong> {userInfo.email}</p>
                    {userInfo.resume_path && (
                        <p className="text-gray-700 mb-4">
                            <strong>Resume:</strong>
                            <a
                                href={`http://localhost:3000/${userInfo.resume_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline ml-1"
                            >
                                View Resume
                            </a>
                        </p>
                    )}
                    <button
                        onClick={handleViewProfile}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                        View Profile
                    </button>
                </div>
            </div>
        </div>
     );
}

export default UserDashboard;
