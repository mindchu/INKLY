import React, { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { api } from '../../util/api'; // Adjust this path 

const DeleteButton = ({ 
    targetId, 
    itemName = "Item", 
    endpointUrl, 
    onDeleteSuccess,
    iconSize = 18 
}) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmDelete = async (e) => {
        e.stopPropagation();
        setIsDeleting(true);
        try {
            const url = endpointUrl || `/content/${targetId}`;
            const response = await api.delete(url);
            
            if (response.success) {
                setShowConfirm(false);
                if (onDeleteSuccess) onDeleteSuccess(targetId);
            } else {
                console.error('Failed to delete:', response.message);
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                className='hover:text-red-500 transition text-gray-600'
                onClick={handleDeleteClick}
                title={`Delete ${itemName}`}
            >
                <MdDelete size={iconSize} />
            </button>

            {/* Attached Confirmation Modal */}
            {showConfirm && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={(e) => e.stopPropagation()} // Prevent clicking backdrop from routing
                >
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
                            <MdDelete size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete {itemName}?</h3>
                        <p className="text-gray-500 text-center mb-8">
                            Are you sure you want to delete this? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeleteButton;