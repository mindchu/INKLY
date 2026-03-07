import React, { useState, useEffect } from 'react';
import { FaTag } from "react-icons/fa6";
import { MdDriveFolderUpload } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { api } from '../../util/api';
import { TagsChipCreate } from '../common/TagsChip';

const Create_note_page = () => {
  const navigate = useNavigate();
  const [noteTitle, setNoteTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [licenseAgreement, setLicenseAgreement] = useState(false);
  const hasFetched = React.useRef(false);

  useEffect(() => {
    const fetchTags = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      try {
        const [allTagsRes, profileRes] = await Promise.all([
          api.get('/tags/all'),
          api.get('/users/me')
        ]);
        setPopularTags(allTagsRes.tags || []);
        setUserInterests(profileRes.interested_tags || []);
      } catch (error) {
        console.error('Error fetching tags:', error);
        hasFetched.current = false;
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (tagInput.trim()) {
      const interestTagObjects = userInterests.map(name => {
        const found = popularTags.find(t => t.name === name);
        return found || { name, color: '#E8F0E5' };
      });
      const combined = [...popularTags];
      interestTagObjects.forEach(it => {
        if (!combined.find(t => t.name === it.name)) combined.push(it);
      });
      const filtered = combined.filter(tag =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(tag.name)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagInput, tags, userInterests, popularTags]);

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
    const maxSize = 10 * 1024 * 1024;
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

  const handlePublish = async () => {
    if (!noteTitle.trim()) {
      showModal('Missing Information', 'Please fill in title field.', 'error');
      return;
    }
    if (!content.trim()){
      showModal('Missing Information', 'Please fill in content field.', 'error');
      return;
    }
    if (attachments.length === 0) {
      showModal('No Attachments', 'Note must have at least one file, If you have no files, create discussion instead.', 'error');
      return;
    }
    if (attachments.length > 0 && !licenseAgreement) {
      showModal('License Agreement', 'Please confirm you have the right to upload these files by checking the license agreement.', 'error');
      return;
    }
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('title', noteTitle);
      formData.append('text', content);
      formData.append('type', 'post');
      formData.append('license_agreement', licenseAgreement);
      tags.forEach(tag => formData.append('tags', tag));
      attachments.forEach(file => formData.append('files', file));
      const response = await api.post('/content', formData, true);
      if (response.success) {
        showModal('Success!', 'Note published successfully.', 'success', () => navigate('/note_forum'));
      } else {
        showModal('Publish Failed', 'Failed to publish note: ' + (response.detail || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Publishing error:', error);
      showModal('Error', 'An error occurred while publishing. Please try again.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', type: 'error', onAction: null
  });

  const showModal = (title, message, type = 'error', onAction = null) => {
    setModalConfig({ isOpen: true, title, message, type, onAction });
  };

  const handleModalClose = () => {
    const { onAction } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    if (onAction) onAction();
  };

  useEffect(() => {
    window.handlePublishNote = handlePublish;
    return () => { delete window.handlePublishNote; };
  }, [noteTitle, content, tags, attachments, licenseAgreement]);

  return (
    <div className='w-full min-h-screen bg-[#EEF2E1] overflow-auto font-["Inter"]'>
      <div className='max-w-5xl mx-auto p-4 sm:p-8'>
        <div className='bg-white rounded-lg shadow-sm border border-[#E3E8D9] p-4 sm:p-8'>

          {/* Note Title */}
          <div className='mb-5 sm:mb-6'>
            <label className='block text-sm font-medium text-[#3A5335] mb-2'>
              Note Title <span className='text-[#C85A5A]'>*</span>
            </label>
            <input
              type='text'
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder='Enter title...'
              className='w-full px-4 py-3 border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all text-[#2C3E28] placeholder:text-[#9AAF94] text-sm sm:text-base'
            />
          </div>

          {/* Content */}
          <div className='mb-5 sm:mb-6'>
            <label className='block text-sm font-medium text-[#3A5335] mb-2'>
              Content <span className='text-[#C85A5A]'>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Write your notes here.. You can include explanations, examples, formulas, and anything else that would be helpful.'
              className='w-full px-4 py-3 border border-[#D4D9C6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B9D63] focus:border-transparent transition-all resize-none h-36 sm:h-40 text-[#2C3E28] placeholder:text-[#9AAF94] text-sm sm:text-base'
            />
            <p className='text-sm text-[#7A8A73] mt-2'>{content.length} characters</p>
          </div>

          {/* Tags */}
          <div className='mb-5 sm:mb-6'>
            <label className='block text-sm font-medium text-[#3A5335] mb-2 flex items-center gap-2'>
              <FaTag className='text-[#577F4E]' size={14} />
              Tags
            </label>
            <div className='relative'>
              <div className='relative w-full border border-[#D4D9C6] bg-white rounded-md min-h-[42px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#6B9D63] focus-within:border-transparent transition-all'>
                <TagsChipCreate tags={tags} handleRemoveTag={handleRemoveTag} />
                <input
                  type='text'
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  onFocus={() => tagInput.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder={tags.length === 0 ? 'Add tags (e.g., Calculus, Math)' : ''}
                  className='flex-1 min-w-[100px] bg-transparent outline-none border-none text-[#2C3E28] placeholder:text-[#9AAF94] py-1 text-sm'
                />
              </div>
              {showSuggestions && (
                <div className='absolute z-10 mt-1 w-full bg-white border border-[#D4D9C6] rounded-md shadow-lg overflow-hidden max-h-[200px] overflow-y-auto'>
                  {suggestions.slice(0, 5).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTags([...tags, suggestion.name || suggestion]);
                        setTagInput('');
                        setShowSuggestions(false);
                      }}
                      className='w-full text-left px-4 py-2 hover:bg-[#F5F7EF] text-[#2C3E28] transition-colors flex items-center justify-between border-b border-[#F0F2EA] last:border-0'
                    >
                      <div className='flex items-center gap-2'>
                        {suggestion.color && (
                          <div className='w-2 h-2 rounded-full flex-shrink-0' style={{ backgroundColor: suggestion.color }}></div>
                        )}
                        <span className='text-sm'>{suggestion.name || suggestion}</span>
                      </div>
                      {userInterests.includes(suggestion.name || suggestion) ? (
                        <span className='text-[10px] bg-[#E8F0E5] text-[#577F4E] px-2 py-0.5 rounded-full flex-shrink-0'>Interested</span>
                      ) : (
                        <span className='text-xs text-gray-400 flex-shrink-0'>({suggestion.use_count || 0})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${dragActive
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
                <div className='flex flex-col items-center gap-2 sm:gap-3'>
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#9AAF94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className='text-sm sm:text-base'>
                    <span className='text-[#6B9D63] font-medium hover:underline'>Click to Upload</span>
                    <span className='text-[#7A8A73]'> or drag and drop</span>
                  </div>
                  <p className='text-xs sm:text-sm text-[#7A8A73]'>PDF, PNG, JPG, DOCX (Max 10MB)</p>
                </div>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className='mt-4 space-y-2'>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-[#F5F7EF] rounded-md border border-[#E3E8D9] gap-2'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <svg className="w-5 h-5 text-[#577F4E] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-[#2C3E28] truncate'>{file.name}</p>
                        <p className='text-xs text-[#7A8A73]'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className='text-[#C85A5A] hover:text-[#A84848] transition-colors flex-shrink-0'
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

          {/* License Agreement */}
          {attachments.length > 0 && (
            <div className='mt-5 sm:mt-6 p-4 bg-[#F5F7EF] rounded-md border border-[#E3E8D9]'>
              <label className='flex items-start gap-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={licenseAgreement}
                  onChange={(e) => setLicenseAgreement(e.target.checked)}
                  className='mt-1 w-4 h-4 accent-[#6B9D63] cursor-pointer flex-shrink-0'
                />
                <span className='text-sm text-[#2C3E28]'>
                  By uploading, I confirm I own these materials and agree to share them with the community, allowing other users to view, download, and use them for their studies.
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-200 transform transition-all">
            <h3 className={`text-xl font-bold mb-2 ${modalConfig.type === 'success' ? 'text-[#577F4E]' : 'text-[#C85A5A]'}`}>
              {modalConfig.title}
            </h3>
            <p className="text-gray-600 mb-6 font-medium text-sm sm:text-base">
              {modalConfig.message}
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleModalClose}
                className={`px-5 py-2.5 rounded-lg font-semibold text-white transition-colors shadow-sm text-sm sm:text-base ${
                  modalConfig.type === 'success'
                    ? 'bg-[#6B9D63] hover:bg-[#577F4E]'
                    : 'bg-[#C85A5A] hover:bg-[#A84848]'
                }`}
              >
                {modalConfig.type === 'success' ? 'Awesome' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create_note_page;