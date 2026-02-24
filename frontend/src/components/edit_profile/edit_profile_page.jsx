import React, { useState, useEffect } from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { MdPhotoCamera } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useProfileContext } from '../../context/ProfileContext'

const Edit_profile_page = () => {
  const navigate = useNavigate()
  const { profileData, updateProfile } = useProfileContext()
  
  // State for form fields - initialize from context
  const [formData, setFormData] = useState({
    username: profileData.username,
    bio: profileData.bio,
    avatarColor: profileData.avatarColor
  })
  
  // State for interests/tags - initialize from context
  const [interests, setInterests] = useState([...profileData.interests])
  const [newTag, setNewTag] = useState('')

  // Update form when profileData changes
  useEffect(() => {
    setFormData({
      username: profileData.username,
      bio: profileData.bio,
      avatarColor: profileData.avatarColor
    })
    setInterests([...profileData.interests])
  }, [profileData])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Add new tag
  const handleAddTag = () => {
    if (newTag.trim() && !interests.includes(newTag.trim())) {
      setInterests([...interests, newTag.trim()])
      setNewTag('')
    }
  }

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setInterests(interests.filter(tag => tag !== tagToRemove))
  }

  // Handle key press (Enter to add tag)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Save changes - this function will be called from Profile_top_bar
  const handleSave = () => {
    // Update the profile context with new data
    updateProfile({
      username: formData.username,
      bio: formData.bio,
      interests: interests
    })
    
    // Navigate back to profile
    navigate('/profile')
  }

  // Expose handleSave to parent component
  // We'll use this in Profile_top_bar
  useEffect(() => {
    window.handleProfileSave = handleSave
    return () => {
      delete window.handleProfileSave
    }
  }, [formData, interests])

  return (
    <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
      {/* Form Content */}
      <div className='max-w-5xl mx-auto mt-8 px-8 pb-8'>
        {/* Profile Picture Section */}
        <div className='bg-white rounded-xl shadow-sm p-8 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Profile Picture</h2>
          <div className='flex items-center gap-6'>
            {/* Avatar */}
            <div className='relative'>
              <div 
                className='w-28 h-28 rounded-full flex items-center justify-center'
                style={{ backgroundColor: formData.avatarColor }}
              >
                <FaUserCircle size={70} className='text-white opacity-70' />
              </div>
              {/* Camera icon overlay */}
              <div className='absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md'>
                <MdPhotoCamera size={20} className='text-[#7CBF6E]' />
              </div>
            </div>
            
            <div>
              <button className='bg-[#7CBF6E] text-white px-6 py-2 rounded-lg font-["Inter"] font-medium hover:bg-[#6BAF5E] transition mb-2'>
                Upload New Picture
              </button>
              <p className='text-sm text-gray-500'>Recommend 400×400px</p>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className='bg-white rounded-xl shadow-sm p-8 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Basic information</h2>
          
          {/* Username */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Username <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleInputChange}
              className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#7CBF6E] focus:outline-none font-["Inter"]'
              placeholder='Enter username'
            />
          </div>

          {/* Bio */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Bio <span className='text-red-500'>*</span>
            </label>
            <textarea
              name='bio'
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#7CBF6E] focus:outline-none font-["Inter"] resize-none'
              placeholder='Tell us about yourself'
            />
          </div>
        </div>

        {/* Interests & Tags Section */}
        <div className='bg-white rounded-xl shadow-sm p-8'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Interests & Tags</h2>
          
          {/* Add Tag Input */}
          <div className='flex gap-3 mb-4'>
            <input
              type='text'
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className='flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#7CBF6E] focus:outline-none font-["Inter"]'
              placeholder='e.g., Calculus, Math, Programming'
            />
            <button 
              onClick={handleAddTag}
              className='px-6 py-2 bg-[#7CBF6E] text-white rounded-lg font-["Inter"] font-medium hover:bg-[#6BAF5E] transition'
            >
              Add
            </button>
          </div>

          {/* Tags Display */}
          <div className='flex flex-wrap gap-3'>
            {interests.map((interest, index) => (
              <span
                key={index}
                className='flex items-center gap-2 bg-[#E8FFDF] text-[#124C09] px-4 py-2 rounded-full text-sm font-medium'
              >
                #{interest}
                <button
                  onClick={() => handleRemoveTag(interest)}
                  className='text-[#124C09] hover:text-red-600 transition'
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Edit_profile_page