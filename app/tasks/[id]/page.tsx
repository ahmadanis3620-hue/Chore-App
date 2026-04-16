'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { use } from 'react'

export default function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [task, setTask] = useState<any>(null)
  const [poster, setPoster] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setCurrentUser(user)

      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()
      setTask(taskData)

      if (taskData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', taskData.user_id)
          .single()
        setPoster(profileData)

        if (user) {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('task_id', id)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: true })
          setMessages(msgs || [])
        }
      }

      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!currentUser) return
    const channel = supabase
      .channel(`messages-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `task_id=eq.${id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, currentUser])

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !task) return
    const receiverId = currentUser.id === task.user_id ? messages.find(m => m.sender_id !== currentUser.id)?.sender_id : task.user_id
    if (!receiverId) return
    await supabase.from('messages').insert({
      task_id: id,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
    })
    setNewMessage('')
  }

  const updateStatus = async (status: string) => {
    await supabase.from('tasks').update({ status }).eq('id', id)
    setTask((prev: any) => ({ ...prev, status }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-500">Task not found.</p>
      </div>
    )
  }

  const isOwner = currentUser?.id === task.user_id

  return (
    <main className="min-h-screen bg-green-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">NaborTask</Link>
        <Link href="/tasks" className="text-sm text-green-600 hover:underline">← Browse Tasks</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              {task.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              task.status === 'open' ? 'bg-blue-100 text-blue-700' :
              task.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {task.status}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h1>
          <p className="text-gray-500 mb-6">{task.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-lg font-semibold text-green-600">{task.budget}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Date Needed</p>
              <p className="text-lg font-semibold text-gray-800">{task.date_needed}</p>
            </div>
          </div>

          <p className="text-sm text-gray-400">Posted by <span className="font-medium text-gray-600">{poster?.display_name || 'Unknown'}</span></p>

          {isOwner && task.status === 'open' && (
            <div className="mt-4 flex gap-2">
              <button onClick={() => updateStatus('in progress')} className="text-sm bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">Mark In Progress</button>
              <button onClick={() => updateStatus('completed')} className="text-sm bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Mark Completed</button>
            </div>
          )}
          {isOwner && task.status === 'in progress' && (
            <div className="mt-4">
              <button onClick={() => updateStatus('completed')} className="text-sm bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Mark Completed</button>
            </div>
          )}

          {currentUser && !isOwner && task.status === 'open' && (
            <button
              onClick={() => setShowChat(true)}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              💬 Message Poster
            </button>
          )}
        </div>

        {/* Chat Section */}
        {currentUser && (isOwner || showChat) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Messages</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm">No messages yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                      msg.sender_id === currentUser.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
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
        )}
      </div>
    </main>
  )
}
