'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function BrowseTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      setTasks(data || [])
      setLoading(false)
    }
    fetchTasks()
  }, [])

  return (
    <main className="min-h-screen bg-green-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">NaborTask</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Open Tasks in Cross Creek</h2>

        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">🏡</p>
            <p className="text-gray-500">No open tasks right now.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {task.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800 mt-2">{task.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{task.description}</p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-green-600 font-medium">{task.budget}</span>
                    <span className="text-gray-400">{task.date_needed}</span>
                  </div>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="block text-center bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
