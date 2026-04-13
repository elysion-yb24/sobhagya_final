import React from 'react';

export default function VideoOffPlaceholderImage() {
    return (
        <div className="w-24 h-24 rounded-full bg-gray-700/50 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 12C16.5 14.485 14.485 16.5 12 16.5C9.515 16.5 7.5 14.485 7.5 12C7.5 9.515 9.515 7.5 12 7.5C14.485 7.5 16.5 9.515 16.5 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
}
