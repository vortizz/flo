'use client'

import { useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Camera } from 'lucide-react'
import Image from 'next/image'
import { Toast } from '@/components/ui/Toast'

export default function ProfileSection() {
  const { user, isLoaded } = useUser()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
  }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayFirstName = firstName ?? user?.firstName ?? ''
  const displayLastName = lastName ?? user?.lastName ?? ''

  function validate() {
    const errs: typeof errors = {}
    if (!displayFirstName.trim()) errs.firstName = 'First name is required'
    if (!displayLastName.trim()) errs.lastName = 'Last name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await user?.update({
        firstName: displayFirstName,
        lastName: displayLastName,
      })
      setFirstName(null)
      setLastName(null)
      setToast({ message: 'Profile updated successfully', type: 'success' })
    } catch (e) {
      console.error(e)
      setToast({
        message: 'Failed to update profile. Please try again.',
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      await user?.setProfileImage({ file })
      setToast({ message: 'Profile photo updated', type: 'success' })
    } catch (err) {
      console.error(err)
      setToast({
        message: 'Failed to upload photo. Please try again.',
        type: 'error',
      })
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  return (
    <section id="profile" data-section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-white">Profile Information</h2>

      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-6 flex flex-col gap-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1a2d3d] flex items-center justify-center text-xl font-bold text-white">
                {user?.firstName?.charAt(0) ?? '?'}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center shadow-lg border border-[#020617] hover:bg-[#2dd4bf] transition-colors disabled:opacity-50"
            >
              <Camera
                size={12}
                className={`text-[#020617] ${uploadingPhoto ? 'animate-pulse' : ''}`}
              />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Profile Photo</p>
            <p className="text-xs text-[#8b949e]">
              Recommended 400x400px. Max 2MB.
            </p>
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#8b949e] font-medium">
              First Name
            </label>
            <input
              type="text"
              value={displayFirstName}
              onChange={e => {
                setFirstName(e.target.value)
                setErrors(p => ({ ...p, firstName: undefined }))
              }}
              className={`bg-[#111c2a] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors ${
                errors.firstName
                  ? 'border-red-400'
                  : 'border-[#1a2d3d] focus:border-[#00C896]/40'
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-400">{errors.firstName}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#8b949e] font-medium">
              Last Name
            </label>
            <input
              type="text"
              value={displayLastName}
              onChange={e => {
                setLastName(e.target.value)
                setErrors(p => ({ ...p, lastName: undefined }))
              }}
              className={`bg-[#111c2a] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors ${
                errors.lastName
                  ? 'border-red-400'
                  : 'border-[#1a2d3d] focus:border-[#00C896]/40'
              }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-400">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#8b949e] font-medium">
            Email Address
          </label>
          <input
            type="email"
            value={user?.primaryEmailAddress?.emailAddress ?? ''}
            disabled
            className="bg-[#111c2a] border border-[#1a2d3d] rounded-lg px-3 py-2 text-sm text-[#8b949e] cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !isLoaded}
            className="px-4 py-2 rounded-lg bg-[#00C896] text-[#040e1a] text-sm font-semibold hover:bg-[#00C896]/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  )
}
