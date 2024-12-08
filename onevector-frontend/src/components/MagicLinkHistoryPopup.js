import React, { useState } from 'react';

const MagicLinkHistoryPopup = ({ magicLinks, onClose }) => {
    const [filterEmail, setFilterEmail] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Filtered magic links based on email and status
    const filteredMagicLinks = magicLinks.filter((link) => {
        const matchesEmail = link.email.toLowerCase().includes(filterEmail.toLowerCase());
        const isExpired = new Date(link.expires_at) < new Date();
        const matchesStatus =
            filterStatus === ''
                ? true
                : (filterStatus === 'active' && !isExpired) || (filterStatus === 'expired' && isExpired);

        return matchesEmail && matchesStatus;
    });

    const clearFilters = () => {
        setFilterEmail('');
        setFilterStatus('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 max-w-4xl relative">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Magic Link History</h2>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                    ✖
                </button>

                <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <input
                        type="text"
                        placeholder="Search by email"
                        className="p-2 border rounded-md w-full md:w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterEmail}
                        onChange={(e) => setFilterEmail(e.target.value)}
                    />
                    <select
                        className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                    </select>
                    <button
                        onClick={clearFilters}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Clear Filters
                    </button>
                </div>

                {filteredMagicLinks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-2 w-1/3">Email</th>
                                    <th className="px-4 py-2 w-1/4">Created At</th>
                                    <th className="px-4 py-2 w-1/4">Expiration</th>
                                    <th className="px-4 py-2 w-1/6">Attempts</th>
                                    <th className="px-4 py-2 w-1/6">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMagicLinks.map((link) => {
                                    const isExpired = new Date(link.expires_at) < new Date();
                                    return (
                                        <tr
                                            key={link.id}
                                            className="bg-white dark:bg-gray-800 hover:bg-gray-100"
                                        >
                                            <td className="px-4 py-2 break-words">{link.email}</td>
                                            <td className="px-4 py-2">
                                                {new Date(link.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2">
                                                {new Date(link.expires_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2 text-center">{link.attempts}</td>
                                            <td
                                                className={`px-4 py-2 ${
                                                    isExpired ? 'text-red-500' : 'text-green-500'
                                                }`}
                                                title={
                                                    isExpired
                                                        ? 'This link has expired.'
                                                        : 'This link is active.'
                                                }
                                            >
                                                {isExpired ? 'Expired' : 'Active'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No magic links found matching the criteria.</p>
                        <img
                            src="/no-data.svg"
                            alt="No data"
                            className="mx-auto w-32 h-32 opacity-50"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MagicLinkHistoryPopup;
