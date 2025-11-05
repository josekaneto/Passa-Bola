"use client";

import React from 'react';

// Ícone SVG para confirmação
const confirmIcon = (
    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>
);

export default function CustomConfirm({ message, onConfirm, onCancel, show }) {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div
                className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center transform transition-all"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-message"
            >
                <div className="flex justify-center mb-4">
                    {confirmIcon}
                </div>
                <p id="confirm-message" className="text-gray-700 text-lg mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onCancel}
                        className="bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

