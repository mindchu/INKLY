import React, { useState, useEffect, useRef } from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { MdPhotoCamera } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useProfileContext } from '../../context/ProfileContext'
import { api } from '../../util/api'

const Edit_profile_page = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { profileData, updateProfile, setProfileData } = useProfileContext()

  const [formData, setFormData] = useState({
    username: profileData?.username || '',
    bio: profileData?.bio || ''
  })

  const [interests, setInterests] = useState(profileData?.interested_tags ? [...profileData.interested_tags] : [])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState('')
  const hasFetchedTags = useRef(false)

  useEffect(() => {
    const fetchAllTags = async () => {
      if (hasFetchedTags.current) return
      hasFetchedTags.current = true
      try {
        const response = await api.get('/tags/all')
        setAllTags(response.tags || [])
      } catch (error) {
        console.error('Failed to fetch tags:', error)
        hasFetchedTags.current = false
      }
    }
    fetchAllTags()
  }, [])

  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = allTags.filter(tag =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !interests.includes(tag.name)
      )
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [tagInput, interests, allTags])

  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.username,
        bio: profileData.bio
      })
      // Use interested_tags from backend
      setInterests(profileData.interested_tags ? [...profileData.interested_tags] : [])
    }
  }, [profileData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleAvatarClick = () => {
    fileInputRef.current.click()
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const response = await api.post('/users/me/avatar', formData, true)
      if (response.success) {
        setProfileData(prev => ({
          ...prev,
          profile_picture_url: response.profile_picture_url
        }))
      }
    } catch (error) {
      console.error('Avatar upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleAddTag = (tag) => {
    const normalizedTag = typeof tag === 'string' ? tag.trim() : tag.name.trim();
    if (normalizedTag && !interests.includes(normalizedTag)) {
      setInterests([...interests, normalizedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setInterests(interests.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const handleSave = async () => {
    setError('')
    const result = await updateProfile({
      username: formData.username,
      bio: formData.bio,
      interests: interests
    })

    if (result.success) {
      navigate('/profile')
    } else {
      setError(result.error || 'Failed to update profile')
    }
  }

  useEffect(() => {
    window.handleProfileSave = handleSave
    return () => {
      delete window.handleProfileSave
    }
  }, [formData, interests])

  if (!profileData) return null

  return (
    <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
      <div className='max-w-5xl mx-auto mt-8 px-8 pb-8'>
        {/* Profile Picture Section */}
        <div className='bg-white rounded-xl shadow-sm p-8 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Profile Picture</h2>
          <div className='flex items-center gap-6'>
            <div className='relative cursor-pointer' onClick={handleAvatarClick}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
                accept="image/*"
              />
              {profileData.profile_picture_url ? (
                <div
                  className={`w-28 h-28 rounded-full bg-cover bg-center border-2 border-green-100 ${uploading ? 'opacity-50' : ''}`}
                  style={{ backgroundImage: `url(${profileData.profile_picture_url})` }}
                />
              ) : (
                <div className={`w-28 h-28 rounded-full flex items-center justify-center bg-green-50 ${uploading ? 'opacity-50' : ''}`}>
                  <FaUserCircle size={70} className='text-green-600 opacity-70' />
                </div>
              )}
              <div className='absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-100'>
                <MdPhotoCamera size={20} className='text-[#7CBF6E]' />
              </div>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className='bg-[#7CBF6E] text-white px-6 py-2 rounded-lg font-["Inter"] font-medium hover:bg-[#6BAF5E] transition mb-2 disabled:opacity-50'
              >
                {uploading ? 'Uploading...' : 'Upload New Picture'}
              </button>
              <p className='text-sm text-gray-500'>Recommend 400×400px</p>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className='bg-white rounded-xl shadow-sm p-8 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Basic information</h2>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Username <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border-2 ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-[#7CBF6E] focus:outline-none font-["Inter"]`}
              placeholder='Enter username'
            />
            {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
          </div>

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

          <div className='relative'>
            <div className='flex gap-3 mb-4'>
              <input
                type='text'
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => tagInput.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                className='flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#7CBF6E] focus:outline-none font-["Inter"]'
                placeholder='e.g., Calculus, Math, Programming'
              />
              <button
                onClick={() => handleAddTag(tagInput)}
                className='px-6 py-2 bg-[#7CBF6E] text-white rounded-lg font-["Inter"] font-medium hover:bg-[#6BAF5E] transition'
              >
                Add
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className='absolute z-10 -mt-3 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden'>
                {suggestions.slice(0, 5).map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleAddTag(tag.name)
                      setShowSuggestions(false)
                    }}
                    className='w-full text-left px-4 py-3 hover:bg-[#F5F7EF] text-gray-700 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0'
                  >
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full' style={{ backgroundColor: tag.color }}></div>
                      <span>{tag.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className='mb-6'>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>Selected Tags</h3>
            <div className='flex flex-wrap gap-3'>
              {interests.map((interest, index) => {
                const tagInfo = allTags.find(t => t.name === interest) || {};
                return (
                  <span
                    key={index}
                    style={{ backgroundColor: tagInfo.color || '#E8FFDF' }}
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
                );
              })}
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>Suggested for You</h3>
            <div className='flex flex-wrap gap-2'>
              {allTags
                .filter(tag => !interests.includes(tag.name))
                .slice(0, 10)
                .map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddTag(tag.name)}
                    style={{ borderColor: tag.color }}
                    className='px-3 py-1.5 bg-[#F5F7EF] text-[#7A8A73] rounded-full text-xs font-medium border hover:brightness-95 transition-all'
                  >
                    + {tag.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Edit_profile_page
