import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OnboardingForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Personal Information States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    // Qualifications States
    const [recentJob, setRecentJob] = useState('');
    const [preferredRoles, setPreferredRoles] = useState('');
    const [availability, setAvailability] = useState('');
    const [workPermitStatus, setWorkPermitStatus] = useState('');
    const [preferredRoleType, setPreferredRoleType] = useState('');
    const [preferredWorkArrangement, setPreferredWorkArrangement] = useState('');
    const [preferredCompensationRange, setPreferredCompensationRange] = useState('');
    const [resume, setResume] = useState(null);
    const [skills, setSkills] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedCertifications, setSelectedCertifications] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [newCertification, setNewCertification] = useState('');
    

    // New state to manage dropdown visibility
    const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
    const [isCertificationsDropdownOpen, setIsCertificationsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchSkillsAndCertifications = async () => {
            try {
                const skillsResponse = await axios.get('http://localhost:3000/api/skills');
                setSkills(skillsResponse.data.map(skill => skill.skill_name));

                const certificationsResponse = await axios.get('http://localhost:3000/api/certifications');
                setCertifications(certificationsResponse.data.map(cert => cert.certification_name));
            } catch (error) {
                console.error('Error fetching skills and certifications:', error);
            }
        };

        fetchSkillsAndCertifications();
    }, []);

    const handleNext = async (event) => {
        event.preventDefault();

        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            const formData = new FormData();
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('phone_no', phoneNo);
            formData.append('address_line1', addressLine1);
            formData.append('address_line2', addressLine2);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('country', country);
            formData.append('postal_code', postalCode);
            formData.append('linkedin_url', linkedinUrl);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('email', email);
            formData.append('recent_job', recentJob);
            formData.append('preferred_roles', preferredRoles);
            formData.append('availability', availability);
            formData.append('work_permit_status', workPermitStatus);
            formData.append('preferred_role_type', preferredRoleType);
            formData.append('preferred_work_arrangement', preferredWorkArrangement);
            formData.append('preferred_compensation_range', preferredCompensationRange);
            formData.append('resume', resume);

            // Append selected skills and certifications
            selectedSkills.forEach(skill => formData.append('skills[]', skill));
            selectedCertifications.forEach(cert => formData.append('certifications[]', cert));

            // Add new skills and certifications
            if (newSkill) {
                formData.append('skills[]', newSkill);
                setNewSkill(''); // Clear the input after submission
            }

            if (newCertification) {
              formData.append('certifications[]', newCertification);
              setNewCertification(''); // Clear the input after submission
          }

          try {
              await axios.post('http://localhost:3000/api/submit-candidate', formData, {
                  headers: {
                      'Content-Type': 'multipart/form-data',
                  },
              });
              navigate('/success'); // Redirect to a success page after submission
          } catch (error) {
              console.error('Error submitting the form:', error);
          }
      }
  };

  const handlePrevious = () => {
      if (step > 1) {
          setStep(step - 1);
      }
  };

  const handleAddSkill = () => {
      if (newSkill && !skills.includes(newSkill)) {
          setSkills([...skills, newSkill]);
          setSelectedSkills([...selectedSkills, newSkill]); // Automatically select the new skill
          setNewSkill(''); // Clear the input
      }
  };

  const handleAddCertification = () => {
      if (newCertification && !certifications.includes(newCertification)) {
          setCertifications([...certifications, newCertification]);
          setSelectedCertifications([...selectedCertifications, newCertification]); // Automatically select the new certification
          setNewCertification(''); // Clear the input
      }
  };

  const toggleSkillsDropdown = () => {
      setIsSkillsDropdownOpen(!isSkillsDropdownOpen);
  };

  const toggleCertificationsDropdown = () => {
      setIsCertificationsDropdownOpen(!isCertificationsDropdownOpen);
  };

  const handleSkillSelect = (skill) => {
      if (!selectedSkills.includes(skill)) {
          setSelectedSkills([...selectedSkills, skill]);
      }
      setIsSkillsDropdownOpen(false); // Close the dropdown after selection
  };

  const handleCertificationSelect = (certification) => {
      if (!selectedCertifications.includes(certification)) {
          setSelectedCertifications([...selectedCertifications, certification]);
      }
      setIsCertificationsDropdownOpen(false); // Close the dropdown after selection
  };

  return (
      <div className="container mx-auto mt-10">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">{step === 1 ? 'Personal Information' : 'Qualifications'}</h2>
              <form onSubmit={handleNext}>
                  {step === 1 && (
                      <div className="flex flex-wrap -mx-2">
                          {/* Personal Information Fields */}
                          <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                              <input
                                  type="text"
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                  required
                              />
                          </div>
                          <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                              <input
                                  type="text"
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                  required
                              />
                          </div>
                          <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                              <input
                                  type="tel"
                                  value={phoneNo}
                                  onChange={(e) => setPhoneNo(e.target.value)}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                  required
                              />
                          </div>
                          <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block text-gray-700 text-sm font-bold mb-2">Address Line 1</label>
                              <input
                                  type="text"
                                  value={addressLine1}
                                  onChange={(e) => setAddressLine1(e.target.value)}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                  required
                              />
                          </div>
                          <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Address Line 2</label>
                                <input
                                    type="text"
                                    value={addressLine2}
                                    onChange={(e) => setAddressLine2(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">State</label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e                                    .target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div className="flex flex-wrap -mx-2">
                            {/* Qualifications Fields */}
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Recent Job</label>
                                <input
                                    type="text"
                                    value={recentJob}
                                    onChange={(e) => setRecentJob(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Roles</label>
                                <input
                                    type="text"
                                    value={preferredRoles}
                                    onChange={(e) => setPreferredRoles(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Availability</label>
                                <input
                                    type="text"
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Work Permit Status</label>
                                <input
                                    type="text"
                                    value={workPermitStatus}
                                    onChange={(e) => setWorkPermitStatus(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Role Type</label>
                                <input
                                    type="text"
                                    value={preferredRoleType}
                                    onChange={(e) => setPreferredRoleType(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Work Arrangement</label>
                                <input
                                    type="text"
                                    value={preferredWorkArrangement}
                                    onChange={(e) => setPreferredWorkArrangement(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Compensation Range</label>
                                <input
                                    type="text"
                                    value={preferredCompensationRange}
                                    onChange={(e) => setPreferredCompensationRange(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Resume</label>
                                <input
                                    type="file"
                                    onChange={(e) => setResume(e.target.files[0])}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus                                    .ring-blue-300"
                                    required
                                />
                            </div>

                            <div className="w-full px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Skills</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={toggleSkillsDropdown}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    >
                                        {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Select Skills'}
                                    </button>
                                    {isSkillsDropdownOpen && (
                                        <div className="absolute z-10 bg-white border rounded shadow-lg mt-1 w-full">
                                            {skills.map((skill, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSkillSelect(skill)}
                                                    className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                                                >
                                                    {skill}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Add a new skill"
                                        className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                                    >
                                        Add Skill
                                    </button>
                                </div>
                            </div>

                            <div className="w-full px-2 mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Certifications</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={toggleCertificationsDropdown}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    >
                                        {selectedCertifications.length > 0 ? selectedCertifications.join(', ') : 'Select Certifications'}
                                    </button>
                                    {isCertificationsDropdownOpen && (
                                        <div className="absolute z-10 bg-white border rounded shadow-lg mt-1 w-full">
                                            {certifications.map((certification, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleCertificationSelect(certification)}
                                                    className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                                                >
                                                    {certification}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        value={newCertification}
                                        onChange={(e) => setNewCertification(e.target.value)}
                                        placeholder="Add a new certification"
                                        className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCertification}
                                        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                                    >
                                        Add Certification
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-6">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded"
                        >
                            {step === 2 ? 'Submit' : 'Next'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnboardingForm;