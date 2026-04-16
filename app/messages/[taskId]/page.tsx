'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { use } from 'react'

export default function MessageThread({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [task, setTask] = useState<any>(null)
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadMessages = async (userId: string) => {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('task_id', taskId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })
    setMessages(msgs || [])

    // Load display names for all participants
    const ids = new Set<string>()
    for (const m of msgs || []) {
      ids.add(m.sender_id)
      ids.add(m.receiver_id)
    }
    const profileMap: Record<string, string> = {}
    for (const pid of ids) {
      if (!profiles[pid]) {
        const { data } = await supabase.from('profiles').select('display_name').eq('id', pid).single()
        profileMap[pid] = data?.display_name || 'Unknown'
      }
    }
    setProfiles(prev => ({ ...prev, ...profileMap }))
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setCurrentUser(user)

      const { data: taskData } = await supabase.from('tasks').select('title, user_id').eq('id', taskId).single()
      setTask(taskData)

      await loadMessages(user.id)
      setLoading(false)
    }
    init()
  }, [taskId])

  // Auto refresh every 5 seconds
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => loadMessages(currentUser.id), 5000)
    return () => clearInterval(interval)
  }, [currentUser, taskId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !task) return
    const receiverId = currentUser.id === task.user_id
      ? messages.find(m => m.sender_id !== currentUser.id)?.sender_id || task.user_id
      : task.user_id

    await supabase.from('messages').insert({
      task_id: taskId,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
    })
    setNewMessage('')
    await loadMessages(currentUser.id)
  }

  if (loading) {
    return <div className="min-h-screen bg-green-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  }

  return (
    <main className="min-h-screen bg-green-50 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">NaborTask</Link>
        <Link href="/messages" className="text-sm text-green-600 hover:underline">← All Messages</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-6 flex-1 flex flex-col w-full">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">{task?.title || 'Conversation'}</h2>
          <Link href={`/tasks/${taskId}`} className="text-sm text-green-600 hover:underline">View task details →</Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No messages yet. Start the conversation!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-xs">
                    <p className={`text-xs mb-1 ${msg.sender_id === currentUser?.id ? 'text-right' : 'text-left'} text-gray-400`}>
                      {profiles[msg.sender_id] || 'Unknown'}
                    </p>
                    <div className={`px-4 py-2 rounded-xl text-sm ${
                      msg.sender_id === currentUser?.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button onClick={sendMessage} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Send</button>
          </div>
        </div>
      </div>
    </main>
  )
}
