'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setStreetAddress(data.street_address || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      street_address: streetAddress,
    }).eq('id', profile.id)
    setSaving(false)
    setMessage(error ? error.message : 'Profile updated!')
  }

  if (loading) {
    return <div className="min-h-screen bg-green-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  }

  return (
    <main className="min-h-screen bg-green-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">NaborTask</Link>
      </nav>
      <div className="max-w-lg mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">My Profile</h2>
        {message && <div className={`text-sm p-3 rounded-lg mb-4 ${message.includes('updated') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{message}</div>}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  )
}
