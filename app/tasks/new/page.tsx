'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

const CATEGORIES = [
  'Yard Work',
  'Cleaning',
  'Errands',
  'Pet Care',
  'Babysitting',
  'Moving Help',
  'Repairs',
  'Other',
]

export default function NewTask() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [dateNeeded, setDateNeeded] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUserId(user.id)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setError('')
    setLoading(true)

    const { error } = await supabase.from('tasks').insert({
      user_id: userId,
      title,
      category,
      description,
      budget,
      date_needed: dateNeeded,
      status: 'open',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen bg-green-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">NaborTask</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Post a New Task</h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Mow my front lawn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe what you need help with..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input
                type="text"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="$25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Needed</label>
              <input
                type="date"
                value={dateNeeded}
                onChange={e => setDateNeeded(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Task'}
          </button>
        </form>
      </div>
    </main>
  )
}
