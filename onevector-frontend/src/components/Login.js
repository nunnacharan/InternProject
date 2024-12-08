import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './images/logo.png'; // Left-side illustration logo
import TalentHubImage from './images/talenthub.png'; // OneVector logo image


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Error message state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(''); // Reset error on each login attempt
    
    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password });
      const user = response.data;

      if (response.status === 200) {
        const userData = response.data.user;
        const token = response.data.token;

        localStorage.setItem('user', JSON.stringify({ id: userData.id, role: userData.role, email: userData.email }));
        localStorage.setItem('token', token);

        if (userData.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'power_user') {
          navigate('/power-user-dashboard');
        } else if (userData.role === 'user') {
          navigate('/user-details', { state: { candidate: user } }); 
        }
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your email or password.');
    }
  };

  // Handle Enter key press to submit form
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="w-1/2 bg-white flex flex-col items-center justify-center p-6 relative">
        <img src={logo} alt="Illustration" className="w-4/5 object-contain mb-32 mt-24" />
        <p className="text-xs text-gray-500 absolute bottom-5 w-full text-center">Top-rated technology expertise for your digital journey</p>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-white flex flex-col items-center p-6 justify-start">
  <div className="flex items-center justify-center space-x-4 mb-6 mt-[100px]">
    <img src={TalentHubImage} alt="OneVector Logo" className="w-[60px] h-[80px]" />
    <h1 className="text-6xl font-normal text-gray-800">TalentHub</h1>
  </div>



        <h3 className="text-3xl font-bold text-gray-800 text-left w-full max-w-[450px] mb-5 mt-10">Login</h3>

        <div className="w-full max-w-[450px] flex flex-col items-center">
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter Your username or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              required
              className="w-full h-[60px] p-4 mb-5 border border-gray-300 rounded-xl text-xl text-gray-800 focus:outline-none transition-all ease-in-out duration-300 transform hover:scale-105 focus:ring-2 focus:ring-gray-500"
            />
            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              required
              className="w-full h-[60px] p-4 mb-5 border border-gray-300 rounded-xl text-xl text-gray-800 focus:outline-none transition-all ease-in-out duration-300 transform hover:scale-105 focus:ring-2 focus:ring-gray-500"
            />
          </form>
        </div>

        {/* Button Container */}
        <div className="flex justify-center items-center w-full mt-5">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-[20%] py-2 rounded-xl text-white font-bold bg-gradient-to-r from-[#15BACD] to-[#094DA2] text-xl cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
          >
            Login
          </button>
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
