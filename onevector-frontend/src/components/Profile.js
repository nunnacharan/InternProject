import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { DocumentDownloadIcon } from '@heroicons/react/solid';

const Profile = () => {
    const location = useLocation();
    const userId = location.state?.userId || null;
    const [userDetails, setUserDetails] = useState(null);
    const [editingSection, setEditingSection] = useState(null); // Track which section is being edited

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/personalDetails/${userId}`);
                setUserDetails(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    if (!userDetails) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-lg text-gray-600 animate-pulse">Loading...</div>
            </div>
        );
    }

    const handleDownloadResume = () => {
        try {
            const resumeUrl = `http://localhost:3000/api/resume/${userDetails.personalDetails.id}`;
            window.open(resumeUrl, '_blank'); // Opens the resume in a new tab
        } catch (error) {
            alert('Failed to view resume');
        }
    };

    const PersonalDetails = ({ details }) => (
        <div className="p-6 bg-white shadow-lg rounded-lg mb-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>ID:</strong> {details.id}</p>
                <p><strong>First Name:</strong> {details.first_name}</p>
                <p><strong>Last Name:</strong> {details.last_name}</p>
                <p><strong>Phone Number:</strong> {details.phone_no}</p>
                <p>
                    <strong>LinkedIn:</strong>{' '}
                    <a
                        href={details.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        {details.linkedin_url}
                    </a>
                </p>
                <p><strong>Address Line 1:</strong> {details.address_line1}</p>
                <p><strong>City:</strong> {details.city}</p>
                <p><strong>State:</strong> {details.state}</p>
                <p><strong>Country:</strong> {details.country}</p>
                <p><strong>Postal Code:</strong> {details.postal_code}</p>
            </div>
            <div className="flex space-x-4 mt-6">
                <button
                    onClick={() => setEditingSection('personal')}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300"
                >
                    Edit
                </button>
                <button
                    onClick={handleDownloadResume}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
                >
                    <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                    Download Resume
                </button>
            </div>
        </div>
    );

    const Qualifications = ({ qualifications }) => (
        <div className="p-6 bg-white shadow-lg rounded-lg mb-6">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Qualifications</h2>
            {qualifications.length > 0 ? (
                qualifications.map((qual, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-4 mb-4">
                        <p><strong>Recent Job:</strong> {qual.recent_job}</p>
                        <p><strong>Preferred Roles:</strong> {qual.preferred_roles}</p>
                        <p><strong>Availability:</strong> {qual.availability}</p>
                        <p><strong>Work Permit Status:</strong> {qual.work_permit_status}</p>
                        <p><strong>Preferred Role Type:</strong> {qual.preferred_role_type}</p>
                        <p><strong>Preferred Work Arrangement:</strong> {qual.preferred_work_arrangement}</p>
                        <p><strong>Compensation:</strong> {qual.compensation}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No qualifications found.</p>
            )}
            <button
                onClick={() => setEditingSection('qualifications')}
                className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300"
            >
                Edit
            </button>
        </div>
    );

    const Skills = ({ skills }) => (
        <div className="p-6 bg-white shadow-lg rounded-lg mb-6">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Skills</h2>
            {skills.length > 0 ? (
                <ul className="list-disc list-inside">
                    {skills.map((skill, index) => (
                        <li key={index} className="text-gray-700">{skill}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No skills found.</p>
            )}
            <button
                onClick={() => setEditingSection('skills')}
                className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300"
            >
                Edit
            </button>
        </div>
    );

    const Certifications = ({ certifications }) => (
        <div className="p-6 bg-white shadow-lg rounded-lg mb-6">
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">Certifications</h2>
            {certifications.length > 0 ? (
                <ul className="list-disc list-inside">
                    {certifications.map((cert, index) => (
                        <li key={index} className="text-gray-700">{cert}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No certifications found.</p>
            )}
            <button
                onClick={() => setEditingSection('certifications')}
                className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300"
            >
                Edit
            </button>
        </div>
    );

    const handleUpdatePersonalDetails = async (updatedData) => {
        try {
            await axios.put(`http://localhost:3000/api/candidates/${userId}/personal`, updatedData);
            setUserDetails(prevDetails => ({
                ...prevDetails,
                personalDetails: { ...prevDetails.personalDetails, ...updatedData }
            }));
            setEditingSection(null); // Close the edit form
        } catch (error) {
            console.error('Error updating personal details:', error);
        }
    };

    const handleUpdateQualifications = async (updatedData) => {
        try {
            await axios.put(`http://localhost:3000/api/candidates/${userId}/qualifications`, updatedData);
            setUserDetails(prevDetails => ({
                ...prevDetails,
                qualifications: updatedData
            }));
            setEditingSection(null); // Close the edit form
        } catch (error) {
            console.error('Error updating qualifications:', error);
        }
    };

    const handleUpdateSkills = async (updatedSkills) => {
        try {
            const skillsArray = updatedSkills.split(',').map(skill => skill.trim()); // Convert to array
            await axios.put(`http://localhost:3000/api/candidates/${userId}/skills`, { skills: skillsArray });
            setUserDetails(prevDetails => ({
                ...prevDetails,
                skills: skillsArray // Update the state with the new skills array
            }));
            setEditingSection(null); // Close the edit form
        } catch (error) {
            console.error('Error updating skills:', error);
        }
    };
    
    const handleUpdateCertifications = async (updatedCertifications) => {
        try {
            const certificationsArray = updatedCertifications.split(',').map(cert => cert.trim()); // Convert to array
            await axios.put(`http://localhost:3000/api/candidates/${userId}/certifications`, { certifications: certificationsArray });
            setUserDetails(prevDetails => ({
                ...prevDetails,
                certifications: certificationsArray // Update the state with the new certifications array
            }));
            setEditingSection(null); // Close the edit form
        } catch (error) {
            console.error('Error updating certifications:', error);
        }
    };

    const Modal = ({ title, onClose, onSubmit, initialData, type }) => {
        const [formData, setFormData] = useState(initialData || {});
    
        useEffect(() => {
            if (initialData) {
                setFormData(initialData);
            }
        }, [initialData]);
    
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        };
    
        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(formData);
        };
    
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl"> {/* Increased max width */}
                    <h2 className="text-2xl font-semibold mb-3">{title}</h2>
                    <form onSubmit={handleSubmit}>
                        {type === 'personal' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Adjusted gap for less space */}
                                <div className="mb-2"> {/* Reduced margin bottom */}
                                    <label className="block text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
    
                                <div className="mb-2"> {/* Reduced margin bottom */}
                                    <label className="block text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
    
                                <div className="mb-2"> {/* Reduced margin bottom */}
                                    <label className="block text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone_no"
                                        value={formData.phone_no || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
    
                                <div className="mb-2"> {/* Reduced margin bottom */}
                                    <label className="block text-gray-700 mb-1">Address Line 1</label>
                                    <input
                                        type="text"
                                        name="address_line1"
                                        value={formData.address_line1 || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
    
                                <div className="mb-2"> {/* Reduced margin bottom */}
                                    <label className="block text-gray-700 mb-1">Address Line 2</label>
                                    <input
                                        type="text"
                                        name="address_line2"
                                        value={formData.address_line2 || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
    
                                <div className="mb-2"> {/* Reduced margin bottom */}
                                    <label className="block text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
    
                                <div className="mb-2"> {/* Reduced margin bottom */}
                                    <label className="block text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                                       </div>

<div className="mb-2"> {/* Reduced margin bottom */}
    <label className="block text-gray-700 mb-1">Country</label>
    <input
        type="text"
        name="country"
        value={formData.country || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded"
    />
</div>

<div className="mb-2"> {/* Reduced margin bottom */}
    <label className="block text-gray-700 mb-1">Postal Code</label>
    <input
        type="text"
        name="postal_code"
        value={formData.postal_code || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded"
    />
</div>

<div className="mb-2 col-span-2"> {/* This will make LinkedIn URL take full width */}
    <label className="block text-gray-700 mb-1">LinkedIn URL</label>
    <input
        type="url"
        name="linkedin_url"
        value={formData.linkedin_url || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded"
    />
</div>
</div>
)}
    

                    
                        {type === 'qualifications' && (
                            <>
                                                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-2">Recent Job</label>
                                    <input
                                        type="text"
                                        name="recent_job"
                                        value={formData.recent_job || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-2">Preferred Roles</label>
                                    <input
                                        type="text"
                                        name="preferred_roles"
                                        value={formData.preferred_roles || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-2">Availability</label>
                                    <input
                                        type="text"
                                        name="availability"
                                        value={formData.availability || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-2">Work Permit Status</label>
                                    <input
                                        type="text"
                                        name="work_permit_status"
                                        value={formData.work_permit_status || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-2">Preferred Role Type</label>
                                    <input
                                        type="text"
                                        name="preferred_role_type"
                                        value={formData.preferred_role_type || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-2">Preferred Work Arrangement</label>
                                    <input
                                        type="text"
                                        name="preferred_work_arrangement"
                                        value={formData.preferred_work_arrangement || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 mb-2">Compensation</label>
                                    <input
                                        type="text"
                                        name="compensation"
                                        value={formData.compensation || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </>
                        )}

{type === 'skills' && (
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-2">Skills</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills ? formData.skills.join(', ') : ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Enter skills, separated by commas"
                            />
                        </div>
                    )}
{type === 'certifications' && (
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-2">Certifications</label>
                            <input
                                type="text"
                                name="certifications"
                                value={formData.certifications ? formData.certifications.join(', ') : ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Enter certifications, separated by commas"
                            />
                        </div>
                    )}


                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-semibold text-center mb-8">Candidate Profile</h1>

                <PersonalDetails details={userDetails.personalDetails} />
                <Qualifications qualifications={userDetails.qualifications} />
                <Skills skills={userDetails.skills} />
                <Certifications certifications={userDetails.certifications} />

{editingSection === 'personal' && (
    <Modal
        title="Edit Personal Details"
        onClose={() => setEditingSection(null)}
        onSubmit={handleUpdatePersonalDetails}
        initialData={userDetails.personalDetails}
        type="personal"
    />
)}

{editingSection === 'qualifications' && (
    <Modal
        title="Edit Qualifications"
        onClose={() => setEditingSection(null)}
        onSubmit={handleUpdateQualifications}
        initialData={userDetails.qualifications[0]} // Assuming you're editing the first qualification
        type="qualifications"
    />
)}

{editingSection === 'skills' && (
    <Modal
        title="Edit Skills"
        onClose={() => setEditingSection(null)}
        onSubmit={handleUpdateSkills}
        initialData={userDetails.skills} // Assuming skills is an array
        type="skills"
    />
)}

{editingSection === 'certifications' && (
    <Modal
        title="Edit Certifications"
        onClose={() => setEditingSection(null)}
        onSubmit={handleUpdateCertifications}
        initialData={userDetails.certifications} // Assuming certifications is an array
        type="certifications"
    />
)}
</div>
</div>
);
};

export default Profile;