import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faUser } from '@fortawesome/free-solid-svg-icons';
import { tableRowVariant, buttonVariant, modalVariant } from './animations';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';
import oneVectorImage from './images/onevector.png'; // Adjust the path based on your folder structure4
import MagicLinkHistoryPopup from './MagicLinkHistoryPopup';


function PowerUserDashboard() {
  const [details, setDetails] = useState(null);
  const [email, setEmail] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [sentEmails, setSentEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleChangeModalOpen, setIsRoleChangeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState(''); // Updated state for success message
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [showMagicLinkPopup, setShowMagicLinkPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
const [magicLinks, setMagicLinks] = useState([]);



  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:3000/api/candidates');
        const filteredCandidates = response.data
        .filter(candidate => candidate.role === 'user') // Only show 'user' role candidates
        .sort((a, b) => a.id - b.id); // Sort by ID

        setCandidates(filteredCandidates);
      } catch (error) {
        setError('Failed to fetch candidates');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const fetchMagicLinks = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/magic-links');
        setMagicLinks(response.data);
        setShowHistoryPopup(true);
    } catch (error) {
        alert('Failed to fetch magic links');
        console.error('Fetch error:', error);
    }
};





  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate and all their associated data?')) {
      try {
        console.log(`Attempting to delete candidate with ID: ${id}`);
        const response = await axios.delete(`http://localhost:3000/api/candidates/${id}`);
        console.log('Delete response:', response);
        
        // Update candidates list after successful deletion
        setCandidates(candidates.filter((candidate) => candidate.id !== id));
        
        // Show success message
        setSuccessMessageText('Candidate deleted successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Failed to delete candidate');
      }
    }
  };
  

  const toggleRole = (candidate) => {
    setSelectedCandidate(candidate);
    setIsRoleChangeModalOpen(true);
  };

  const sendMagicLink = async () => {
    if (!email) {
      alert('Please enter a valid email.');
      return;
    }
  
    try {
      // Send magic link to the email
      await axios.post('http://localhost:3000/api/send-magic-link', { email });
  
      // Add the sent email to history
      setSentEmails([...sentEmails, email]);
  
      // Clear email field after sending the link
      setEmail('');
  
      // Set success message and show it
      setSuccessMessageText('Magic Link sent successfully!');
      setShowSuccessMessage(true);
  
      // Close the form modal
      setShowForm(false);
  
      // Auto-hide the success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      alert('Failed to send magic link');
    }
  };
  

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleShowDetails = (candidate) => {
    navigate('/power-candidate-details', { state: { candidate } });
  };

  const isActive = (path) => location.pathname === path;

  const handleHistoryClick = () => {
    setHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
  };
/*
  const confirmRoleChange = async (newRole) => {
    if (!selectedCandidate) return;

    try {
      await axios.put(`http://localhost:3000/api/candidates/${selectedCandidate.id}/role`, { role: newRole });

      const updatedCandidates = candidates.map((candidate) =>
        candidate.id === selectedCandidate.id ? { ...candidate, role: newRole } : candidate
      );
      setCandidates(updatedCandidates);

      const action = newRole === 'power_user' ? 'Promoted' : 'Demoted';
      setSuccessMessageText(`${action} successfully!`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setIsRoleChangeModalOpen(false);
    } catch {
      alert(`Failed to update role to ${newRole}`);
    }
  };*/

  const confirmDelete = async () => {
    if (!selectedCandidate) return;

    try {
      await axios.delete(`http://localhost:3000/api/candidates/${selectedCandidate.id}`);
      setCandidates(candidates.filter((candidate) => candidate.id !== selectedCandidate.id));
      setSuccessMessageText('Candidate deleted successfully!');
      setShowSuccessMessage(true);
      setIsDeleteModalOpen(false);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch {
      alert('Failed to delete candidate');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {showMagicLinkPopup && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg w-96">
            <p className="text-center font-semibold">Magic Link sent successfully!</p>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="bg-green-500 text-white p-4 fixed top-0 left-0 right-0 text-center z-20">
          {successMessageText}
        </div>
      )}

     {/* Navbar */}
<header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
  <div className="flex justify-between items-center p-4">
    {/* Logo and Title on the left */}
    <div className="flex items-center space-x-3">
      <img src={oneVectorImage} alt="OneVector Logo" className="w-[30px] h-[40px]" />
      <h1 className="text-2xl font-normal text-gray-800 tracking-wide">
        TalentHub
      </h1>
    </div>

    {/* Buttons on the right */}
    <div className="flex items-center space-x-6">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-2 hover:bg-red-400"
      >
        <FaSignOutAlt size={14} />
        <span>Logout</span>
      </button>
    </div>
  </div>
</header>

{/* Main Content */}
<main className="pt-20 px-4 lg:px-16">
  {/* Search and Actions */}
  <div className="flex justify-between items-center mb-4 mt-8">
    <input
      type="text"
      placeholder="Search by username"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="border border-black p-2 rounded-lg w-1/2"
    />
    <div className="flex items-center space-x-4">
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-gradient-to-r from-[#15ABCD] to-[#094DA2] rounded-lg text-white"
      >
        Add User
      </button>

      <FaHistory 
                size={20} 
                className="cursor-pointer text-black" 
                onClick={fetchMagicLinks}  // Trigger fetch on click
            />

            {/* Render Magic Link History Popup */}
            {showHistoryPopup && (
                <MagicLinkHistoryPopup
                    magicLinks={magicLinks}
                    onClose={() => setShowHistoryPopup(false)}
                />
            )}

    </div>
  </div>

        {/* Add User Form */}
        {showForm && (
  <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20">
    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
      <h3 className="text-2xl font-semibold text-black mb-4">Add a New User</h3>
      <div className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={sendMagicLink}
          className="px-6 py-3 text-white font-medium rounded-lg bg-gradient-to-r from-[#15abcd] to-[#094DA2] hover:opacity-90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#094DA2]"
          >
          Send Magic Link
        </button>
        <button
          onClick={() => setShowForm(false)}  // Close the modal when clicked
          className="bg-gray-300 text-black px-6 py-3 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        >
          Close
        </button>
      </div>
      

    </div>
  </div>
)}

<div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
  {loading ? (
    <p>Loading...</p>
  ) : filteredCandidates.length ? (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-[3px] border-[#F0F4F8] text-left">
        <thead className="bg-[#F7FAFC] text-black">
          <tr>
            <th className="py-4 px-6 border-b-[3px] border-[#E5E9EF]">TITLE</th>
            <th className="py-4 px-6 border-b-[3px] border-[#E5E9EF]">EMAIL</th>
            <th className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF]">ROLE</th>
            <th className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF]">USERNAME</th> {/* New Column Header */}
            <th className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF]">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map((candidate, index) => (
            <tr
              key={candidate.id}
              className={`${
                index % 2 === 0 ? "bg-[#FBFCFD]" : "bg-white"
              }`}
            >
              <td className="py-4 px-6 border-b-[3px] border-[#E5E9EF]">
                <div className="flex items-center">
                  <span className="text-black font-medium">
                    {candidate.first_name && candidate.last_name
                      ? `${candidate.first_name} ${candidate.last_name}`
                      : candidate.first_name || candidate.last_name || "N/A"}
                  </span>
                  {candidate.role === "power_user" && (
                    <FontAwesomeIcon
                      icon={faCrown}
                      className="ml-2 text-yellow-500"
                      title="Power User"
                    />
                  )}
                </div>
              </td>
              <td className="py-4 px-6 border-b-[3px] border-[#E5E9EF]">{candidate.email}</td>
              <td className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF]">
                {candidate.role === "power_user" ? "Power User" : "User"}
              </td>
              <td className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF]">
                {candidate.username} {/* New Column Data */}
              </td>
              <td className="py-4 px-6 text-center border-b-[3px] border-[#E5E9EF]">
                <div className="flex justify-center items-center gap-4">
                { /* <button
                    onClick={() => toggleRole(candidate)}
                    className="px-4 py-2 bg-white border border-black text-black rounded-lg hover:bg-gradient-to-r hover:from-[#15ABCD] hover:to-[#094DA2] hover:text-white hover:border-0"
                  >
                    {candidate.role === "power_user" ? "Demote" : "Promote"}
                  </button>*/}
                  <button
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleShowDetails(candidate)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-600"
                  >
                    Show Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="p-4 text-center">No candidates found.</p>
  )}
</div>

      </main>
      {/* History Modal */}
      {historyModalOpen && (
        <motion.div
          variants={modalVariant}
          initial="hidden"
          animate="visible"
          className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20"
        >
          <motion.div
            variants={modalVariant}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
          >
            <h3 className="text-lg font-semibold text-black mb-4">History</h3>
            <div className="overflow-y-auto max-h-64 space-y-2">
              {sentEmails.length > 0 ? (
                sentEmails.map((email, index) => (
                  <div
                    key={index}
                    className="border border-black p-2 rounded-lg bg-gray-50"
                  >
                    <p className="text-black">{email}</p>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-black">No history available.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <motion.button
                variants={buttonVariant}
                whileHover="hover"
                whileTap="tap"
                onClick={closeHistoryModal}
                className="px-4 py-2 bg-white border border-black text-black rounded-lg hover:bg-black hover:text-white"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedCandidate && (
        <motion.div
          variants={modalVariant}
          initial="hidden"
          animate="visible"
          className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            variants={modalVariant}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
          >
            <h3 className="text-lg font-semibold text-black">Confirm Deletion</h3>
            <p className="my-4 text-black">
              Are you sure you want to delete {selectedCandidate.username}?
            </p>
           <div className="flex justify-end space-x-4">
  <motion.button
    variants={buttonVariant}
    whileHover="hover"
    whileTap="tap"
    onClick={() => setIsDeleteModalOpen(false)}
    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
  >
    Cancel
  </motion.button>
  
  <motion.button
    variants={buttonVariant}
    whileHover="hover"
    whileTap="tap"
    onClick={confirmDelete}
    className="px-4 py-2 bg-gradient-to-r from-[#15ABCD] to-[#094DA2] text-white rounded-lg"
  >
    Confirm
  </motion.button>
</div>

          </motion.div>
        </motion.div>
      )}

      {/* Role Change Modal */}
      {isRoleChangeModalOpen && selectedCandidate && (
        <motion.div
          variants={modalVariant}
          initial="hidden"
          animate="visible"
         className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            variants={modalVariant}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
          >
            <h3 className="text-lg font-semibold text-black">Confirm Role Change</h3>
            <p className="my-4 text-black">
              Are you sure you want to {selectedCandidate.role === 'power_user' ? 'demote' : 'promote'}{' '}
              {selectedCandidate.username}{' '}
              {selectedCandidate.role === 'power_user' && (
                <FaCrown className="text-yellow-500 ml-2 inline-block" />
              )}
              ?
            </p>
            <div className="flex justify-end space-x-4">
  <motion.button
    variants={buttonVariant}
    whileHover="hover"
    whileTap="tap"
    onClick={() => setIsRoleChangeModalOpen(false)}
    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
  >
    Cancel
  </motion.button>
{/*
  <motion.button
    variants={buttonVariant}
    whileHover="hover"
    whileTap="tap"
    onClick={() =>
      confirmRoleChange(
        selectedCandidate.role === 'power_user' ? 'user' : 'power_user'
      )
    }
    className="px-4 py-2 bg-gradient-to-r from-[#15ABCD] to-[#094DA2] text-white rounded-lg"
  >
    Confirm
  </motion.button>*/}
</div>
 </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default PowerUserDashboard;
