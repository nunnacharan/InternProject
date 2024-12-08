import React, { useEffect, useState } from 'react';

function DarkModeSwitcher() {
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('theme') === 'dark'
    );

    // Toggle dark mode class on the <html> element
    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDarkMode(!isDarkMode);
    };

    // On initial render, check the saved theme from localStorage
    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
                onClick={toggleDarkMode}
                className={`w-10 h-5 rounded-full ${
                    isDarkMode ? 'bg-green-600' : 'bg-gray-300'
                } relative transition-colors duration-300`}
            >
                <span
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        isDarkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );
}

export default DarkModeSwitcher;
