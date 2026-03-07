import React from 'react';
import { IoClose, IoWarningOutline } from 'react-icons/io5';

const AlertModal = ({ isOpen, onClose, title = 'Alert', message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-full">
                                <IoWarningOutline className="text-red-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-[#7CBF6E] hover:bg-[#6BAF5E] text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 active:scale-[0.98]"
                    >
                        Got it
                    </button>
                </div>
            </div>
            <div className="fixed inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default AlertModal;
