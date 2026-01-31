import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

interface MessageState {
  messages: any[]
  friends: User[]
  loading: boolean
  error: string | null
  
  fetchMessages: (userId: string, friendId: string) => Promise<void>
  sendMessage: (senderId: string, receiverId: string, content: string) => Promise<void>
  fetchFriends: (userId: string) => Promise<void>
  subscribeToMessages: (userId: string, callback: (message: any) => void) => () => void
  clearError: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  friends: [],
  loading: false,
  error: null,

  fetchMessages: async (userId: string, friendId: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(nickname, avatar_url),
          receiver:receiver_id(nickname, avatar_url)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      set({ messages: data || [], loading: false })
    } catch (error: any) {
      set({ 
        error: error.message || '获取消息失败', 
        loading: false 
      })
    }
  },

  sendMessage: async (senderId: string, receiverId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
          is_read: false
        }])
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        set(state => ({
          messages: [...state.messages, data]
        }))
      }
    } catch (error: any) {
      set({ error: error.message || '发送消息失败' })
    }
  },

  fetchFriends: async (userId: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:users!friendships_addressee_id_fkey(nickname, avatar_url)
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')
      
      if (error) throw error
      
      set({ friends: data?.map(f => f.friend) || [], loading: false })
    } catch (error: any) {
      set({ 
        error: error.message || '获取好友列表失败', 
        loading: false 
      })
    }
  },

  subscribeToMessages: (userId: string, callback: (message: any) => void) => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))