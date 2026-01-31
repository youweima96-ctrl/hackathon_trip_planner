import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useMessageStore } from '../stores/messageStore'
import { supabase } from '../lib/supabase'
import { User, UserPlus, UserCheck, UserX, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

export function FriendsPage() {
  const { user } = useAuthStore()
  const { friends, loading, fetchFriends } = useMessageStore()
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      fetchFriends(user.id)
      fetchFriendRequests()
    }
  }, [user?.id, fetchFriends])

  const fetchFriendRequests = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey(nickname, avatar_url)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
      setFriendRequests(data || [])
    } catch (error) {
      toast.error('获取好友请求失败')
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nickname, avatar_url')
        .neq('id', user?.id)
        .ilike('nickname', `%${searchQuery}%`)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      toast.error('搜索用户失败')
    }
  }

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('friendships')
        .insert([{
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending'
        }])

      if (error) throw error
      
      toast.success('好友请求发送成功')
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      toast.error('发送好友请求失败')
    }
  }

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId)

      if (error) throw error
      
      toast.success(accept ? '已接受好友请求' : '已拒绝好友请求')
      fetchFriendRequests()
      if (accept) {
        fetchFriends(user!.id)
      }
    } catch (error) {
      toast.error('处理好友请求失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-8 text-center">
          好友管理
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 搜索添加好友 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              添加好友
            </h2>
            
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入用户昵称搜索..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <button
                onClick={searchUsers}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                搜索
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-medium">{result.nickname}</span>
                    </div>
                    <button
                      onClick={() => sendFriendRequest(result.id)}
                      className="px-3 py-1 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors"
                    >
                      添加好友
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 好友请求 */}
          {friendRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                好友请求 ({friendRequests.length})
              </h2>
              
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-medium">{request.requester.nickname}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFriendRequest(request.id, true)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleFriendRequest(request.id, false)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 我的好友 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              我的好友 ({friends.length})
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{friend.nickname}</p>
                        <p className="text-sm text-green-600">在线</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {/* 跳转到聊天 */}}
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserX className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>还没有好友</p>
                <p className="text-sm mt-1">搜索用户添加好友开始交流</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}