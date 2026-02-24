import React, { useState } from 'react';
import { FaTag } from "react-icons/fa6";
import { MdDriveFolderUpload } from "react-icons/md";

const Create_note_page = () => {
  const [noteTitle, setNoteTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach(file => {
      if (validTypes.includes(file.type) && file.size <= maxSize) {
        setAttachments(prev => [...prev, file]);
      } else {
        alert(`File ${file.name} is not valid. Please upload PDF, PNG, JPG, or DOCX files under 10MB.`);
      }
    });
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (!noteTitle.trim() || !content.trim()) {
      alert('Please fill in both title and content fields.');
      return;
    }
    
    const noteData = {
      title: noteTitle,
      content: content,
      tags: tags,
      attachments: attachments.map(f => f.name),
      createdAt: new Date().toISOString()
    };
    
    console.log('Publishing note:', noteData);
    // Add your publish logic here
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      setNoteTitle('');
      setContent('');
      setTags([]);
      setAttachments([]);
    }
  };

  return (
    <div className='w-full min-h-screen bg-[#EEF2E1] overflow-auto font-["Inter"]'>
      {/* Main Content */}
      <div className='max-w-5xl mx-auto p-8'>
        <div className='bg-white rounded-lg shadow-sm border border-[#E3E8D9] p-8'>
          
          {/* Note Title */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-[#3A5335] mb-2'>
              Note Title <span className='text-[#C85A5A]'>*</span>
            </label>
            <input
              type='text'
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder='Enter title...'
              className='w-full px-4 py-3 border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all text-[#2C3E28] placeholder:text-[#9AAF94]'
            />
          </div>

          {/* Content */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-[#3A5335] mb-2'>
              Content <span className='text-[#C85A5A]'>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Write your notes here.. You can include explanations, examples, formulas, and anything else that would be helpful.'
              className='w-full px-4 py-3 border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all resize-none h-40 text-[#2C3E28] placeholder:text-[#9AAF94]'
            />
            <p className='text-sm text-[#7A8A73] mt-2'>
              {content.length} characters
            </p>
          </div>

          {/* Tags */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-[#3A5335] mb-2 flex items-center gap-2'>
              <FaTag className='text-[#577F4E]' size={14} />
              Tags
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder='Add Tags (e.g., Calculus, Math, English)'
                className='flex-1 px-4 py-2.5 border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all text-[#2C3E28] placeholder:text-[#9AAF94]'
              />
              <button
                onClick={handleAddTag}
                className='px-5 py-2.5 bg-[#6B9D63] text-white rounded-md hover:bg-[#577F4E] transition-all duration-200 font-medium'
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-3'>
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F0E5] text-[#577F4E] rounded-full text-sm border border-[#C7D9C1]'
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className='hover:text-[#C85A5A] transition-colors'
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
            <label className='block text-sm font-medium text-[#3A5335] mb-2 flex items-center gap-2'>
              <MdDriveFolderUpload className='text-[#577F4E]' size={18} />
              Attachments
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive 
                  ? 'border-[#6B9D63] bg-[#F0F5ED]' 
                  : 'border-[#D4D9C6] bg-[#FAFBF8]'
              }`}
            >
              <input
                type='file'
                id='file-upload'
                onChange={handleFileInput}
                accept='.pdf,.png,.jpg,.jpeg,.docx'
                multiple
                className='hidden'
              />
              <label htmlFor='file-upload' className='cursor-pointer'>
                <div className='flex flex-col items-center gap-3'>
                  <svg className="w-12 h-12 text-[#9AAF94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>
                    <span className='text-[#6B9D63] font-medium hover:underline'>Click to Upload</span>
                    <span className='text-[#7A8A73]'> or drag and drop</span>
                  </div>
                  <p className='text-sm text-[#7A8A73]'>
                    PDF, PNG, JPG, DOCX (Max 10MB)
                  </p>
                </div>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className='mt-4 space-y-2'>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-[#F5F7EF] rounded-md border border-[#E3E8D9]'
                  >
                    <div className='flex items-center gap-3'>
                      <svg className="w-5 h-5 text-[#577F4E]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className='text-sm font-medium text-[#2C3E28]'>{file.name}</p>
                        <p className='text-xs text-[#7A8A73]'>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className='text-[#C85A5A] hover:text-[#A84848] transition-colors'
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Create_note_page;
