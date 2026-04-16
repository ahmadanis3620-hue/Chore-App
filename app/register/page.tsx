'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

const CROSS_CREEK_STREETS = [
  'autumnwood', 'birchwood', 'brooksedge', 'cheltenham', 'cloverleaf',
  'copperfield', 'creekside', 'crossfield', 'crossing', 'darbywood',
  'fernwood', 'foxcreek', 'greenfield', 'heatherwood', 'hillcrest',
  'knollwood', 'lakewood', 'leafwood', 'maplewood', 'meadowbrook',
  'millcreek', 'mistymeadow', 'oakfield', 'oakwood', 'ridgewood',
  'riverwood', 'rosewood', 'rustlingoak', 'shadywood', 'springfield',
  'stoneybrook', 'summerfield', 'sunsetridge', 'sweetbriar', 'sycamore',
  'timberwood', 'valleyview', 'willowbrook', 'willowwood', 'windfield',
  'windmill', 'windstone', 'winterwood', 'woodfield', 'woodstream'
]

function isValidCrossCreekAddress(address: string): boolean {
  const lower = address.toLowerCase().replace(/\s+/g, '')
  return CROSS_CREEK_STREETS.some(street => lower.includes(street))
}

export default function Register() {
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    password: '',
    street_address: '',
    agree: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidCrossCreekAddress(form.street_address)) {
      setError('Your address does not appear to be in Cross Creek, Hilliard. This app is for Cross Creek residents only.')
      return
    }

    if (!form.agree) {
      setError('You must confirm you are a Cross Creek resident.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: form.display_name,
      email: form.email,
      street_address: form.street_address,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <Link href="/" className="text-green-600 font-bold text-xl">NaborTask</Link>
        <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Create your account</h2>
        <p className="text-gray-500 text-sm mb-6">Cross Creek residents only</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Display Name</label>
            <input
              name="display_name"
              value={form.display_name}
              onChange={handleChange}
              required
              placeholder="How neighbours will see you"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Min 6 characters"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <input
              name="street_address"
              value={form.street_address}
              onChange={handleChange}
              required
              placeholder="e.g. 123 Stoneybrook Blvd"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <p className="text-xs text-gray-400 mt-1">Must be a Cross Creek street address</p>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className="mt-1"
            />
            <label className="text-sm text-gray-600">
              I confirm that I am a current resident of Cross Creek, Hilliard OH
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 hover:underline">Login</Link>
        </p>
      </div>
    </main>
  )
}