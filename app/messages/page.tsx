'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setCurrentUser(user)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      // Group by task_id, show latest message per task
      const taskMap = new Map<string, any>()
      for (const msg of msgs || []) {
        if (!taskMap.has(msg.task_id)) {
          taskMap.set(msg.task_id, msg)
        }
      }

      const convos = []
      for (const [taskId, latestMsg] of taskMap) {
        const { data: task } = await supabase.from('tasks').select('title').eq('id', taskId).single()
        const otherId = latestMsg.sender_id === user.id ? latestMsg.receiver_id : latestMsg.sender_id
        const { data: otherProfile } = await supabase.from('profiles').select('display_name').eq('id', otherId).single()
        convos.push({
          taskId,
          taskTitle: task?.title || 'Unknown Task',
          otherName: otherProfile?.display_name || 'Unknown',
          lastMessage: latestMsg.content,
          createdAt: latestMsg.created_at,
        })
      }
      setConversations(convos)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-green-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">NaborTask</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">My Messages</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">💬</p>
            <p className="text-gray-500">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(c => (
              <Link key={c.taskId} href={`/messages/${c.taskId}`} className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{c.taskTitle}</p>
                    <p className="text-sm text-gray-500">with {c.otherName}</p>
                    <p className="text-sm text-gray-400 mt-1 truncate max-w-md">{c.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
