"use client";

import React from 'react';

// Ícones SVG para os tipos de alerta
const icons = {
    success: (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
    error: (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
    info: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
};

export default function CustomAlert({ message, onClose, show, type = 'info' }) {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-10 flex justify-center items-center z-50 p-4">
            <div
                className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center transform transition-all"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="alert-message"
            >
                <div className="flex justify-center mb-4">
                    {icons[type] || icons.info}
                </div>
                <p id="alert-message" className="text-gray-700 text-lg mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-pink text-white font-bold py-2 px-8 rounded-lg hover:bg-pink/90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-pink focus:ring-opacity-50"
                >
                    OK
                </button>
            </div>
        </div>
    );
}