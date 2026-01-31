import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Antique, AntiqueImage } from '../lib/supabase'

interface AntiqueState {
  antiques: Antique[]
  loading: boolean
  error: string | null
  
  fetchAntiques: () => Promise<void>
  fetchAntiqueById: (id: string) => Promise<Antique | null>
  fetchAntiqueImages: (antiqueId: string) => Promise<AntiqueImage[]>
  createAntique: (antique: Omit<Antique, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAntique: (id: string, antique: Partial<Antique>) => Promise<void>
  deleteAntique: (id: string) => Promise<void>
  clearError: () => void
}

export const useAntiqueStore = create<AntiqueState>((set, get) => ({
  antiques: [],
  loading: false,
  error: null,

  fetchAntiques: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('antiques')
        .select(`
          *,
          antique_images (
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({ antiques: data || [], loading: false })
    } catch (error: any) {
      set({ 
        error: error.message || '获取古董列表失败', 
        loading: false 
      })
    }
  },

  fetchAntiqueById: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('antiques')
        .select(`
          *,
          antique_images (
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      set({ loading: false })
      return data
    } catch (error: any) {
      set({ 
        error: error.message || '获取古董详情失败', 
        loading: false 
      })
      return null
    }
  },

  fetchAntiqueImages: async (antiqueId: string) => {
    try {
      const { data, error } = await supabase
        .from('antique_images')
        .select('*')
        .eq('antique_id', antiqueId)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      
      return data || []
    } catch (error: any) {
      set({ error: error.message || '获取古董图片失败' })
      return []
    }
  },

  createAntique: async (antique: Omit<Antique, 'id' | 'created_at' | 'updated_at'>) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('antiques')
        .insert([antique])
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        set(state => ({
          antiques: [data, ...state.antiques],
          loading: false
        }))
      }
    } catch (error: any) {
      set({ 
        error: error.message || '创建古董失败', 
        loading: false 
      })
    }
  },

  updateAntique: async (id: string, antique: Partial<Antique>) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('antiques')
        .update(antique)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        set(state => ({
          antiques: state.antiques.map(item => 
            item.id === id ? { ...item, ...data } : item
          ),
          loading: false
        }))
      }
    } catch (error: any) {
      set({ 
        error: error.message || '更新古董失败', 
        loading: false 
      })
    }
  },

  deleteAntique: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('antiques')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        antiques: state.antiques.filter(item => item.id !== id),
        loading: false
      }))
    } catch (error: any) {
      set({ 
        error: error.message || '删除古董失败', 
        loading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))