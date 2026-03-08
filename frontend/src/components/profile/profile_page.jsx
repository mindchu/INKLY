import React from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { useProfileContext } from '../../context/ProfileContext'
import { getMediaUrl } from '../../config'
import { TagsChipView } from '../common/TagsChip'


const Profile_page = () => {
  const { profileData, loading } = useProfileContext()

  if (loading) {
    return (
      <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
        <p className='font-[Inter] text-xl animate-pulse text-gray-600'>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className='w-full h-full bg-[#EEF2E1] flex items-center justify-center'>
        <p className='font-[Inter] text-xl text-gray-600'>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className='w-full h-full bg-[#EEF2E1] overflow-auto'>
      <div className='max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-8 pb-24 md:pb-12'>
        <div className='bg-white rounded-xl shadow-sm p-5 md:p-8'>

          {/* Profile Info Section */}
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6 mb-6'>

            {/* Avatar */}
            {profileData.profile_picture_url ? (
              <div
                className='w-24 h-24 md:w-32 md:h-32 rounded-full flex-shrink-0 bg-cover bg-center border border-gray-100'
                style={{ backgroundImage: `url(${getMediaUrl(profileData.profile_picture_url)})` }}
              />
            ) : (
              <div className='w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100'>
                <FaUserCircle size={64} className='text-green-600 opacity-70 md:hidden' />
                <FaUserCircle size={80} className='text-green-600 opacity-70 hidden md:block' />
              </div>
            )}

            {/* User Info */}
            <div className='flex-1 text-center sm:text-left'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-1'>{profileData.username}</h2>
              <p className='text-gray-500 mb-3 text-sm md:text-base'>@{profileData.username?.toLowerCase().replace(/\s/g, '_')}</p>
              <p className='text-gray-700 mb-4 leading-relaxed text-sm md:text-base'>{profileData.bio || 'No bio yet.'}</p>
              <p className='text-gray-600 text-xs md:text-sm'>{profileData.email}</p>
            </div>
          </div>

          <div className='border-t border-gray-200 my-5 md:my-6'></div>

          {/* Stats Section */}
          <div className='flex gap-6 md:gap-8 mb-6 justify-center sm:justify-start'>
            <div className='text-center'>
              <p className='text-xl md:text-2xl font-bold text-gray-800'>{profileData.follower_ids?.length || 0}</p>
              <p className='text-xs md:text-sm text-gray-600'>Followers</p>
            </div>
            <div className='text-center'>
              <p className='text-xl md:text-2xl font-bold text-gray-800'>{profileData.following_ids?.length || 0}</p>
              <p className='text-xs md:text-sm text-gray-600'>Following</p>
            </div>
          </div>

          <TagsChipView tags={profileData.interested_tags} />
        </div>
      </div>
    </div>
  )
}

export default Profile_page