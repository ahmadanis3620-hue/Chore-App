'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setLoggedIn(true)
    })
  }, [])

  return (
    <main className="min-h-screen bg-green-50">
      {/* Header */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">NaborTask</h1>
        <div className="flex gap-4">
          {loggedIn ? (
            <Link href="/dashboard" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-green-600 hover:text-green-800 font-medium">
                Login
              </Link>
              <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          Neighbours Helping Neighbours
        </h2>
        <p className="text-xl text-gray-600 mb-4">
          NaborTask connects Cross Creek residents for everyday chores and tasks.
        </p>
        <p className="text-gray-500 mb-10">
          Need your grass cut? Want to earn some extra money? You're in the right place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 font-medium">
            Get Started
          </Link>
          <Link href="/tasks" className="border border-green-600 text-green-600 px-8 py-3 rounded-lg text-lg hover:bg-green-50 font-medium">
            Browse Tasks
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-20">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-4">🏡</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cross Creek Only</h3>
          <p className="text-gray-500">Only verified Cross Creek residents can post or accept tasks.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Anonymous Chat</h3>
          <p className="text-gray-500">Message neighbours privately without sharing your personal details.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">You Set the Price</h3>
          <p className="text-gray-500">Agree on payment directly with your neighbour. Cash, Venmo, whatever works.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 py-6 text-sm">
        NaborTask — Cross Creek, Hilliard OH
      </footer>
    </main>
  )
}