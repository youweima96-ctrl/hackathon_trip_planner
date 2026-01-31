import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase配置缺失，请检查环境变量')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          nickname: string
          avatar_url: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          nickname: string
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          nickname?: string
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      antiques: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          price: number
          category: string | null
          era: string | null
          material: string | null
          dimensions: string | null
          is_sold: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          price: number
          category?: string | null
          era?: string | null
          material?: string | null
          dimensions?: string | null
          is_sold?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string | null
          era?: string | null
          material?: string | null
          dimensions?: string | null
          is_sold?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      antique_images: {
        Row: {
          id: string
          antique_id: string
          image_url: string
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          antique_id: string
          image_url: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          antique_id?: string
          image_url?: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type User = Tables['users']['Row']
export type Antique = Tables['antiques']['Row']
export type AntiqueImage = Tables['antique_images']['Row']
export type Friendship = Tables['friendships']['Row']
export type Message = Tables['messages']['Row']