'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

const CATEGORIES = ['Yard Work', 'Cleaning', 'Errands', 'Pet Care', 'Babysitting', 'Moving Help', 'Repairs', 'Other']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Availability() {
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [rate, setRate] = useState('')
  const [notes, setNotes] = useState('')
  const [listings, setListings] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
      setDisplayName(profile?.display_name || '')

      const { data } = await supabase
        .from('availability')
        .select('*, profiles(display_name)')
        .order('created_at', { ascending: false })
      setListings(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || selectedDays.length === 0) { setError('Please select at least one day.'); return }
    setError('')
    setSubmitting(true)

    const { error: err } = await supabase.from('availability').insert({
      user_id: userId,
      category,
      available_days: selectedDays,
      rate,
      notes,
    })

    if (err) { setError(err.message); setSubmitting(false); return }

    // Reload listings
    const { data } = await supabase
      .from('availability')
      .select('*, profiles(display_name)')
      .order('created_at', { ascending: false })
    setListings(data || [])
    setCategory(CATEGORIES[0])
    setSelectedDays([])
    setRate('')
    setNotes('')
    setSubmitting(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-green-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  }

  return (
    <main className="min-h-screen bg-green-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">NaborTask</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Post Your Availability</h2>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4 mb-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={displayName} disabled className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What can you help with?</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${selectedDays.includes(day) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}>
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
            <input value={rate} onChange={e => setRate(e.target.value)} required placeholder="e.g. $15/hr or $50 flat" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Anything else neighbours should know..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {submitting ? 'Posting...' : 'Post Availability'}
          </button>
        </form>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Available Helpers</h2>
        {listings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">🙋</p>
            <p className="text-gray-500">No one has posted availability yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {listings.map(a => (
              <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{a.category}</span>
                  <span className="text-green-600 font-medium text-sm">{a.rate}</span>
                </div>
                <p className="font-semibold text-gray-800">{a.profiles?.display_name || 'Unknown'}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(a.available_days || []).map((d: string) => (
                    <span key={d} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{d}</span>
                  ))}
                </div>
                {a.notes && <p className="text-gray-500 text-sm mt-2">{a.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
