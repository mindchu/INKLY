import React from 'react';
import { GoPaperclip } from 'react-icons/go';
import { MdOutlineFileDownload } from 'react-icons/md';

const NoteModal = ({ note, onClose }) => {
    if (!note) return null;

    // Function to get file icon and color based on file type
    const getFileIcon = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        if (extension === 'pdf') {
            return { label: 'PDF', color: 'bg-green-600' };
        } else if (extension === 'xlsx' || extension === 'xls') {
            return { label: 'XLS', color: 'bg-green-600' };
        } else if (extension === 'docx' || extension === 'doc') {
            return { label: 'DOC', color: 'bg-blue-600' };
        } else {
            return { label: 'FILE', color: 'bg-gray-600' };
        }
    };

    // Mock attachments data based on the note ID
    const getAttachments = (note) => {
        const attachmentsList = [];
        
        // For myNotes (IDs 1-5)
        if (note.id === 1) {
            attachmentsList.push({ name: 'Mitosis_Meiosis_Diagrams.pdf', size: '3.2 MB' });
        } else if (note.id === 2) {
            attachmentsList.push({ name: 'Reaction_Mechanisms.pdf', size: '2.8 MB' });
        } else if (note.id === 3) {
            attachmentsList.push({ name: 'Eigenvalues_Solutions.pdf', size: '2.1 MB' });
        } else if (note.id === 4) {
            attachmentsList.push({ name: 'TCP_IP_Protocol.pdf', size: '3.5 MB' });
        } else if (note.id === 5) {
            attachmentsList.push({ name: 'Quantum_Mechanics.pdf', size: '4.1 MB' });
        }
        // For otherNotes (IDs 101-110)
        else if (note.id === 101) {
            attachmentsList.push({ name: 'Integration_Techniques.pdf', size: '2.4 MB' });
        } else if (note.id === 102) {
            attachmentsList.push({ name: 'Tree_Algorithms.pdf', size: '3.1 MB' });
        } else if (note.id === 103) {
            attachmentsList.push({ name: 'Revolution_Timeline.pdf', size: '2.8 MB' });
        } else if (note.id === 104) {
            attachmentsList.push(
                { name: 'Supply_Demand.pdf', size: '2.2 MB' },
                { name: 'Market_Analysis.xlsx', size: '156 KB' }
            );
        } else if (note.id === 105) {
            attachmentsList.push({ name: 'OOP_Examples.pdf', size: '1.9 MB' });
        } else if (note.id === 106) {
            attachmentsList.push(
                { name: 'Hypothesis_Testing.pdf', size: '3.5 MB' },
                { name: 'Test_Data.xlsx', size: '245 KB' }
            );
        } else if (note.id === 107) {
            attachmentsList.push({ name: 'First_Amendment.pdf', size: '2.7 MB' });
        } else if (note.id === 108) {
            attachmentsList.push({ name: 'Heart_Diagrams.pdf', size: '4.2 MB' });
        } else if (note.id === 109) {
            attachmentsList.push({ name: 'Neural_Networks.pdf', size: '3.8 MB' });
        } else if (note.id === 110) {
            attachmentsList.push({ name: 'Subjunctive_Rules.pdf', size: '1.5 MB' });
        } else {
            attachmentsList.push({ name: 'Notes.pdf', size: '2.0 MB' });
        }
        
        return attachmentsList;
    };

    const attachments = getAttachments(note);

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between rounded-t-2xl">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {note.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {note.author.split(' ')[1] || 'U'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{note.author}</p>
                                <p className="text-sm text-gray-500">Posted 2 days ago</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 hover:bg-gray-100 rounded-full transition text-2xl font-bold text-gray-600"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {note.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="text-sm px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            {note.description}
                        </p>
                    </div>

                    {/* Attachments */}
                    {attachments.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <GoPaperclip size={20} className="text-gray-600" />
                                <h3 className="font-semibold text-gray-900">
                                    Attachments ({attachments.length})
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {attachments.map((file, index) => {
                                    const fileInfo = getFileIcon(file.name);
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`${fileInfo.color} text-white px-3 py-2 rounded-lg font-bold text-sm`}>
                                                    {fileInfo.label}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-sm text-gray-500">{file.size}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                                                <MdOutlineFileDownload size={20} className="text-gray-600" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteModal;