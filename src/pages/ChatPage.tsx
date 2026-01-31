import { useState, useEffect } from 'react'
import { useMessageStore } from '../stores/messageStore'
import { useAuthStore } from '../stores/authStore'
import { ChatWindow } from '../components/ChatWindow'
import { User, MessageCircle, UserPlus } from 'lucide-react'

export function ChatPage() {
  const { user } = useAuthStore()
  const { friends, loading, fetchFriends } = useMessageStore()
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [selectedFriendName, setSelectedFriendName] = useState<string>('')

  useEffect(() => {
    if (user?.id) {
      fetchFriends(user.id)
    }
  }, [user?.id, fetchFriends])

  const handleSelectFriend = (friendId: string, friendName: string) => {
    setSelectedFriend(friendId)
    setSelectedFriendName(friendName)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-8 text-center">
          聊天交流
        </h1>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 好友列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">好友列表</h2>
                    <button className="text-amber-600 hover:text-amber-700">
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="divide-y">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleSelectFriend(friend.id, friend.nickname)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedFriend === friend.id ? 'bg-amber-50 border-r-2 border-amber-600' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {friend.nickname}
                          </p>
                          <p className="text-xs text-gray-500">在线</p>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </button>
                  ))}
                  
                  {friends.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">暂无好友</p>
                      <p className="text-xs mt-1">添加好友开始聊天</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 聊天窗口 */}
            <div className="lg:col-span-2">
              {selectedFriend ? (
                <ChatWindow friendId={selectedFriend} friendName={selectedFriendName} />
              ) : (
                <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">选择一个好友开始聊天</h3>
                    <p className="text-sm">点击左侧好友列表中的任意好友</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}