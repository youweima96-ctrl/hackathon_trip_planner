import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nickname: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (userData) {
          set({ 
            user: userData as User, 
            isAuthenticated: true, 
            loading: false 
          })
        }
      }
    } catch (error: any) {
      set({ 
        error: error.message || '登录失败，请检查邮箱和密码', 
        loading: false 
      })
    }
  },

  register: async (email: string, password: string, nickname: string) => {
    set({ loading: true, error: null })
    
    try {
      console.log('开始注册流程:', { email, nickname })
      
      // 使用 Supabase Auth 注册（数据库触发器会自动处理邮箱验证和用户资料创建）
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
          }
        }
      })
      
      console.log('Supabase注册响应:', { data, error })
      
      if (error) {
        console.error('Supabase注册错误:', error)
        let errorMessage = '注册失败，请重试'
        
        if (error.message) {
          if (error.message.includes('already registered') || error.message.includes('exists')) {
            errorMessage = '该邮箱已被注册'
          } else if (error.message.includes('weak')) {
            errorMessage = '密码太弱，请使用更复杂的密码'
          } else if (error.message.includes('invalid')) {
            errorMessage = '邮箱格式不正确'
          } else {
            errorMessage = error.message
          }
        }
        
        set({ 
          error: errorMessage, 
          loading: false 
        })
        return
      }
      
      if (data.user) {
        console.log('用户注册成功，用户ID:', data.user.id)
        
        // 等待数据库触发器完成用户资料创建
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 获取用户资料（由触发器自动创建）
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        console.log('获取用户资料结果:', { userData, fetchError })
        
        if (userData && !fetchError) {
          console.log('用户资料获取成功')
          set({ 
            user: userData as User, 
            isAuthenticated: true, 
            loading: false 
          })
        } else {
          console.log('用户资料未找到，创建临时用户数据')
          // 如果触发器未创建用户资料，创建临时数据
          set({ 
            user: {
              id: data.user.id,
              email,
              nickname,
              avatar_url: null,
              is_verified: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User, 
            isAuthenticated: true, 
            loading: false 
          })
        }
        
        console.log('注册成功！已自动登录')
      } else {
        console.error('注册失败：没有返回用户数据')
        set({ 
          error: '注册失败，请重试', 
          loading: false 
        })
      }
    } catch (error: any) {
      console.error('注册过程出错:', error)
      set({ 
        error: error.message || '注册失败，请重试', 
        loading: false 
      })
    }
  },

  logout: async () => {
    set({ loading: true })
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message || '退出登录失败', 
        loading: false 
      })
    }
  },

  checkAuth: async () => {
    set({ loading: true })
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userData) {
          set({ 
            user: userData as User, 
            isAuthenticated: true, 
            loading: false 
          })
        }
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false 
        })
      }
    } catch (error: any) {
      set({ 
        error: error.message || '认证检查失败', 
        loading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))