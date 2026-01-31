import { useState, useEffect } from 'react'
import { useAntiqueStore } from '../stores/antiqueStore'
import { useAuthStore } from '../stores/authStore'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Heart, MessageCircle } from 'lucide-react'
import type { Antique, AntiqueImage } from '../lib/supabase'

export function AntiqueList() {
  const { antiques, loading, fetchAntiques } = useAntiqueStore()
  const { isAuthenticated } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')

  const categories = [
    '全部', '陶瓷', '玉器', '书画', '青铜器', '家具', '珠宝', '其他'
  ]

  const priceRanges = [
    { label: '全部价格', value: '' },
    { label: '￥0 - ￥1,000', value: '0-1000' },
    { label: '￥1,000 - ￥10,000', value: '1000-10000' },
    { label: '￥10,000 - ￥100,000', value: '10000-100000' },
    { label: '￥100,000+', value: '100000+' }
  ]

  useEffect(() => {
    fetchAntiques()
  }, [fetchAntiques])

  const filteredAntiques = antiques.filter(antique => {
    const matchesSearch = antique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (antique.description && antique.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = !selectedCategory || selectedCategory === '全部' || antique.category === selectedCategory
    
    let matchesPrice = true
    if (priceRange) {
      const price = antique.price
      if (priceRange === '0-1000') matchesPrice = price >= 0 && price <= 1000
      else if (priceRange === '1000-10000') matchesPrice = price >= 1000 && price <= 10000
      else if (priceRange === '10000-100000') matchesPrice = price >= 10000 && price <= 100000
      else if (priceRange === '100000+') matchesPrice = price >= 100000
    }
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  // 获取古董图片（扩展类型）
  const getAntiqueImages = (antique: Antique & { antique_images?: AntiqueImage[] }) => {
    return antique.antique_images || []
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索古董..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            {isAuthenticated && (
              <Link
                to="/publish"
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                发布古董
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 古董网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAntiques.map(antique => (
          <div key={antique.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/antique/${antique.id}`}>
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                {(() => {
                  const images = getAntiqueImages(antique)
                  return images.length > 0 ? (
                    <img
                      src={images[0].image_url}
                      alt={antique.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span>暂无图片</span>
                    </div>
                  )
                })()}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                  {antique.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {antique.description || '暂无描述'}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-amber-600 font-bold text-lg">
                    ￥{antique.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {antique.category || '未分类'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{antique.era || '年代不详'}</span>
                  <span>{antique.material || '材质不详'}</span>
                </div>
              </div>
            </Link>
            
            <div className="px-4 pb-4 flex items-center justify-between">
              <button className="flex items-center text-gray-500 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4 mr-1" />
                收藏
              </button>
              <button className="flex items-center text-gray-500 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4 mr-1" />
                联系
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAntiques.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无符合条件的古董</p>
        </div>
      )}
    </div>
  )
}