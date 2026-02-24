import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { IoIosClose } from "react-icons/io";

const EditNoteModal = ({ note, onClose, onSave }) => {
    if (!note) return null;

    // State for form fields
    const [formData, setFormData] = useState({
        title: note.title,
        description: note.description,
        attachments: note.attachments
    });

    // State for tags
    const [tags, setTags] = useState(note.tags || []);
    const [tagInput, setTagInput] = useState('');

    // State for managing attachments
    const [uploadedFiles, setUploadedFiles] = useState(
        formData.attachments > 0 
            ? [{
                name: `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                size: (Math.random() * 3 + 1).toFixed(1),
                type: 'PDF'
            }]
            : []
    );

    // Ref for file input
    const fileInputRef = useRef(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add tag
    const handleAddTag = () => {
        if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    // Remove tag
    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Handle Enter key in tag input
    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    // Handle attachment deletion
    const handleDeleteAttachment = (index) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        setFormData(prev => ({
            ...prev,
            attachments: newFiles.length
        }));
    };

    // Get file type label
    const getFileType = (fileName) => {
        const extension = fileName.split('.').pop().toUpperCase();
        if (['PDF'].includes(extension)) return 'PDF';
        if (['PNG', 'JPG', 'JPEG'].includes(extension)) return 'IMG';
        if (['DOCX', 'DOC'].includes(extension)) return 'DOC';
        return 'FILE';
    };

    // Get file type color
    const getFileTypeColor = (type) => {
        switch(type) {
            case 'PDF': return 'bg-red-600';
            case 'IMG': return 'bg-blue-600';
            case 'DOC': return 'bg-green-600';
            default: return 'bg-gray-600';
        }
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            // Check file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum file size is 10MB.`);
                return;
            }

            // Check file type
            const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert(`${file.name} is not a supported file type.`);
                return;
            }

            const fileType = getFileType(file.name);
            const newFile = {
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1), // Convert to MB
                type: fileType,
                file: file // Store the actual file object if needed
            };

            setUploadedFiles(prev => [...prev, newFile]);
        });

        // Update attachments count
        setFormData(prev => ({
            ...prev,
            attachments: uploadedFiles.length + files.length
        }));

        // Reset file input
        e.target.value = '';
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        
        // Create a synthetic event to reuse handleFileUpload
        const syntheticEvent = {
            target: {
                files: files,
                value: ''
            }
        };
        
        handleFileUpload(syntheticEvent);
    };

    // Trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Handle save
    const handleSave = () => {
        const updatedNote = {
            ...note,
            title: formData.title,
            description: formData.description,
            tags: tags,
            attachments: formData.attachments,
            files: uploadedFiles // Include the uploaded files
        };
        onSave(updatedNote);
        onClose();
    };

    // Handle backdrop click - only close if clicking the backdrop itself
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Edit Note
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter title..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Write your notes here.. You can include explanations, examples, formulas, and anything else that would be helpful."
                        />
                        <p className="text-sm text-gray-500 mt-2">{formData.description.length} characters</p>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🏷️ Tags
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleTagKeyPress}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Add Tags (e.g., Calculus, Math, English)"
                            />
                            <button
                                onClick={handleAddTag}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                            >
                                Add
                            </button>
                        </div>
                        
                        {/* Display tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-red-500 transition"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📎 Attachments ({uploadedFiles.length})
                        </label>
                        
                        {/* Display current attachments */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className={`${getFileTypeColor(file.type)} text-white px-4 py-3 rounded-lg font-bold text-sm`}>
                                                {file.type}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {file.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {file.size} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteAttachment(index)}
                                            className="p-2 hover:bg-red-100 rounded-lg transition text-gray-600 hover:text-red-600"
                                            title="Delete attachment"
                                        >
                                            <IoIosClose size={28} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf,.png,.jpg,.jpeg,.docx"
                            multiple
                            className="hidden"
                        />

                        {/* Upload new attachment button */}
                        <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition cursor-pointer"
                            onClick={handleUploadClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <p className="text-gray-600 font-medium">Click to Upload or drag and drop</p>
                                <p className="text-sm text-gray-500">PDF, PNG, JPG, DOCX (Max 10MB)</p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditNoteModal;