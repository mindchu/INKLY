import React from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { useProfileContext } from '../../context/ProfileContext'

const Profile_page = () => {
  const { profileData } = useProfileContext()

  return (
    <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
      {/* Profile Card */}
      <div className='max-w-5xl mx-auto mt-8 px-8'>
        <div className='bg-white rounded-xl shadow-sm p-8'>
          {/* Profile Info Section */}
          <div className='flex items-start gap-6 mb-6'>
            {/* Avatar */}
            <div 
              className='w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0'
              style={{ backgroundColor: profileData.avatarColor }}
            >
              <FaUserCircle size={80} className='text-white opacity-70' />
            </div>

            {/* User Info */}
            <div className='flex-1'>
              <h2 className='text-3xl font-bold text-gray-800 mb-1'>{profileData.username}</h2>
              <p className='text-gray-500 mb-3'>{profileData.handle}</p>
              <p className='text-gray-700 mb-4 leading-relaxed'>{profileData.bio}</p>
              <p className='text-gray-600'>{profileData.email}</p>
            </div>
          </div>

          {/* Divider */}
          <div className='border-t border-gray-200 my-6'></div>

          {/* Stats Section */}
          <div className='flex gap-8 mb-6'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-gray-800'>{profileData.stats.notes}</p>
              <p className='text-sm text-gray-600'>Notes</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-gray-800'>{profileData.stats.discussions}</p>
              <p className='text-sm text-gray-600'>Discussion</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-gray-800'>{profileData.stats.followers}</p>
              <p className='text-sm text-gray-600'>Followers</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-gray-800'>{profileData.stats.following}</p>
              <p className='text-sm text-gray-600'>Following</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-gray-800'>{profileData.stats.likes}</p>
              <p className='text-sm text-gray-600'>Likes</p>
            </div>
          </div>

          {/* Divider */}
          <div className='border-t border-gray-200 my-6'></div>

          {/* Interests Section */}
          <div>
            <h3 className='text-lg font-semibold text-gray-700 mb-4'>Interests</h3>
            <div className='flex flex-wrap gap-3'>
              {profileData.interests.map((interest, index) => (
                <span
                  key={index}
                  className='bg-[#E8FFDF] text-[#124C09] px-4 py-2 rounded-full text-sm font-medium'
                >
                  #{interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile_page