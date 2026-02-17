import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input } from '@components/formsInput'
import { Button } from '@components/buttons'
import { useAppSelector } from '@hooks/redux'
import { selectProfileData, selectToken } from '@store/features/auth/authReducer'
import { useUploadProfilePictureMutation } from '@store/features/profile/profileSlice'
import { useLazyGetProfileQuery } from '@store/features/profile/profileSlice'
import { setProfileData } from '@store/features/auth/authReducer'
import { useAppDispatch } from '@hooks/redux'
import { eSnack, sSnack } from '@hooks/useToast'

const API_BASE = 'https://api.souvenir.live'

function getProfileImageUrl(path: string | undefined): string {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

interface ProfileFormData {
  fullName: string
  email: string
}

const ProfileForm = () => {
  const dispatch = useAppDispatch()
  const profileData = useAppSelector(selectProfileData)
  const token = useAppSelector(selectToken)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const existingProfileImageUrl = getProfileImageUrl(profileData?.profilePicture)
  const [uploadProfilePicture, { isLoading: isUploadingPicture }] = useUploadProfilePictureMutation()
  const [getProfile] = useLazyGetProfileQuery()

  const {
    control,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: '',
      email: '',
    },
  })

  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData.firstname && profileData.lastname
          ? `${profileData.firstname} ${profileData.lastname}`
          : '',
        email: profileData.email || '',
      })
    }
  }, [profileData, reset])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setProfilePicture(reader.result as string)
    reader.readAsDataURL(file)
    // Upload via API
    try {
      const result = await uploadProfilePicture(file).unwrap()
      if (result?.message) sSnack(result.message)
      const profileResult = await getProfile(undefined).unwrap()
      if (profileResult?.data && token) {
        dispatch(setProfileData({
          profileData: profileResult.data as import('@store/features/auth/auth.types').ProfileData,
          token,
        }))
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as { error?: string })?.error ||
        'Profile picture upload failed'
      eSnack(message)
    }
    event.target.value = ''
  }

  return (
    <div className="w-full  mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 font-ManropeBold">
          Profile
        </h1>
        <p className="text-gray-600 font-Manrope">
          Profile information
        </p>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 font-ManropeBold">
          Personal Information
        </h2>

        {/* Profile Picture Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : existingProfileImageUrl ? (
                <img
                  src={existingProfileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-8 h-8 md:w-12 md:h-12 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2 font-ManropeBold">
              Profile Picture
            </h3>
            <p className="text-sm text-gray-600 mb-4 font-Manrope">
              Upload a photo for shipper's profile
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="profile-picture-upload"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingPicture}
                loader={isUploadingPicture}
                onClick={() => document.getElementById('profile-picture-upload')?.click()}
                className="px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload New Picture</span>
                </div>
              </Button>
            </label>
          </div>
        </div>

        {/* Form Fields - Name and Email (disabled) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input
                label="Full Name"
                type="text"
                placeholder="Full Name"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                label="Email"
                type="email"
                placeholder="Email"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
