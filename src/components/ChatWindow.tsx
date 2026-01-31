import { useState, useEffect } from 'react'
import { useMessageStore } from '../stores/messageStore'
import { useAuthStore } from '../stores/authStore'
import { Send, User } from 'lucide-react'

interface ChatWindowProps {
  friendId: string
  friendName: string
}

export function ChatWindow({ friendId, friendName }: ChatWindowProps) {
  const { user } = useAuthStore()
  const { messages, loading, sendMessage, fetchMessages, subscribeToMessages } = useMessageStore()
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (user?.id && friendId) {
      fetchMessages(user.id, friendId)
      
      const unsubscribe = subscribeToMessages(user.id, (message) => {
        if (message.sender_id === friendId || message.receiver_id === friendId) {
          fetchMessages(user.id, friendId)
        }
      })
      
      return () => {
        unsubscribe()
      }
    }
  }, [user?.id, friendId, fetchMessages, subscribeToMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user?.id) return

    await sendMessage(user.id, friendId, newMessage)
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* 聊天头部 */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold">{friendName}</h3>
            <p className="text-amber-100 text-sm">在线</p>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === user?.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender_id === user?.id ? 'text-amber-100' : 'text-gray-500'
              }`}>
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>还没有聊天记录，开始对话吧！</p>
          </div>
        )}
      </div>

      {/* 消息输入 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}