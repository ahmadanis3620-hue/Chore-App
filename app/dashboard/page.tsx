'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [messageCount, setMessageCount] = useState(0)
  const [availability, setAvailability] = useState<any[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      setTasks(tasksData || [])

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
      setMessageCount(count || 0)

      const { data: availData } = await supabase
        .from('availability')
        .select('*, profiles(display_name)')
        .order('created_at', { ascending: false })
        .limit(6)
      setAvailability(availData || [])
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-green-50">
      {/* Header */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">NaborTask</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {profile?.display_name}!</span>
          <Link href="/messages" className="text-sm text-gray-500 hover:text-green-600">
            Messages{messageCount > 0 && <span className="ml-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">{messageCount}</span>}
          </Link>
          <Link href="/profile" className="text-sm text-gray-500 hover:text-green-600">Profile</Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-red-500"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tasks Section */}
        <section className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Tasks That Need Doing</h2>
              <p className="text-gray-500 text-sm mt-1">Neighbours who need something done and are willing to pay</p>
            </div>
            <Link
              href="/tasks/new"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 whitespace-nowrap"
            >
              + Post a Task
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <p className="text-4xl mb-4">🏡</p>
              <p className="text-gray-500 mb-2">No tasks yet in Cross Creek!</p>
              <p className="text-gray-400 text-sm">Be the first to post a task for your neighbours.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map(task => (
                <div key={task.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {task.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-800 mt-2">{task.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-medium">{task.budget}</p>
                      <p className="text-gray-400 text-xs mt-1">{task.date_needed}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {task.status}
                    </span>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-sm text-green-600 hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Availability Section */}
        <section>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Neighbours Available to Help</h2>
              <p className="text-gray-500 text-sm mt-1">Neighbours offering their time and skills for hire</p>
            </div>
            <Link
              href="/availability"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 whitespace-nowrap"
            >
              + Post Availability
            </Link>
          </div>
          {availability.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <p className="text-4xl mb-4">🙋</p>
              <p className="text-gray-500 mb-2">No one has posted availability yet.</p>
              <p className="text-gray-400 text-sm">Let your neighbours know you&apos;re available to help.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.map(a => (
                <div key={a.id} className="bg-white rounded-xl p-6 shadow-sm">
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
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}