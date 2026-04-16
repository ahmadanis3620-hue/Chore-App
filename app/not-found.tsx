'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-2">NaborTask</h1>
        <p className="text-6xl mb-6">🏡</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">This page doesn&apos;t exist in the neighbourhood.</p>
        <Link
          href="/dashboard"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
