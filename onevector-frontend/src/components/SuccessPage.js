import React from 'react';
import { useLocation } from 'react-router-dom';

const SuccessPage = () => {
    const location = useLocation();
    const message = location.state?.message || 'Success!';

    return (
        <div className="container mx-auto mt-10">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Submission Successful</h2>
                <p className="text-lg">{message}</p>
                <div className="mt-4">
                    <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;