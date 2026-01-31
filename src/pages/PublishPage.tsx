import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useAntiqueStore } from '../stores/antiqueStore'
import { useBlockchainStore } from '../stores/blockchainStore'
import { supabase } from '../lib/supabase'
import { uploadMultipleImages } from '../lib/storage'
import { compressMultipleImages, isValidImageFile, formatFileSize } from '../lib/imageUtils'
import { BlockchainService } from '../lib/blockchain'
import { Upload, X, Plus, Minus, Image as ImageIcon, Shield, Coins } from 'lucide-react'
import { toast } from 'sonner'

export function PublishPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createAntique } = useAntiqueStore()
  const { isWalletConnected, walletAddress } = useBlockchainStore()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    era: '',
    material: '',
    dimensions: ''
  })
  
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [mintNFT, setMintNFT] = useState(false)
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5)
  const [blockchainService] = useState(() => new BlockchainService())

  const categories = [
    '陶瓷', '玉器', '书画', '青铜器', '家具', '珠宝', '其他'
  ]

  const eras = [
    '商周', '春秋战国', '秦汉', '魏晋南北朝', '隋唐', '宋元', '明清', '民国', '近现代'
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // 验证文件
    const validFiles = files.filter(file => {
      if (!isValidImageFile(file)) {
        toast.error(`文件 ${file.name} 格式不支持或过大`)
        return false
      }
      return true
    })

    if (validFiles.length + images.length > 5) {
      toast.error('最多只能上传5张图片')
      return
    }

    try {
      // 压缩图片
      const compressedFiles = await compressMultipleImages(validFiles, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        onProgress: (progress) => {
          console.log(`压缩进度: ${progress}%`)
        }
      })

      // 预览图片
      compressedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
      
      setImages(prev => [...prev, ...compressedFiles])
      toast.success(`成功添加 ${compressedFiles.length} 张图片`)
    } catch (error) {
      toast.error('图片处理失败')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('请先登录')
      return
    }

    if (!formData.name.trim()) {
      toast.error('请输入古董名称')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('请输入有效的价格')
      return
    }

    if (mintNFT && !isWalletConnected) {
      toast.error('请先连接钱包才能铸造NFT')
      return
    }

    setLoading(true)

    try {
      let imageUrls: string[] = []
      
      // 上传图片
      if (images.length > 0) {
        toast.info('正在上传图片...')
        imageUrls = await uploadMultipleImages(images, `antiques/${user.id}`)
        
        if (imageUrls.length === 0) {
          toast.error('图片上传失败')
          setLoading(false)
          return
        }
        
        toast.success(`成功上传 ${imageUrls.length} 张图片`)
      }

      // 创建古董记录
      const { data: antiqueData, error: antiqueError } = await supabase
        .from('antiques')
        .insert([{
          user_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category || null,
          era: formData.era || null,
          material: formData.material.trim() || null,
          dimensions: formData.dimensions.trim() || null,
          is_sold: false,
          is_active: true
        }])
        .select()
        .single()

      if (antiqueError) throw antiqueError

      // 上传古董图片记录
      if (imageUrls.length > 0 && antiqueData) {
        const { error: imagesError } = await supabase
          .from('antique_images')
          .insert(
            imageUrls.map((url, index) => ({
              antique_id: antiqueData.id,
              image_url: url,
              is_primary: index === 0,
              sort_order: index
            }))
          )

        if (imagesError) {
          console.error('保存图片记录失败:', imagesError)
        }
      }

      // 铸造NFT
      if (mintNFT && isWalletConnected && walletAddress && antiqueData) {
        try {
          toast.info('正在铸造NFT...')
          
          // 准备NFT元数据
          const nftMetadata = {
            name: formData.name.trim(),
            description: formData.description.trim() || '珍贵的古董收藏品',
            image: imageUrls[0] || '',
            attributes: [
              { trait_type: '类别', value: formData.category || '其他' },
              { trait_type: '年代', value: formData.era || '未知' },
              { trait_type: '材质', value: formData.material.trim() || '未知' },
              { trait_type: '尺寸', value: formData.dimensions.trim() || '未知' }
            ],
            external_url: `${window.location.origin}/antique/${antiqueData.id}`
          }

          // 铸造NFT
          const blockchainService = new BlockchainService()
          await blockchainService.connectWallet()
          const { tokenId, transactionHash } = await blockchainService.mintNFT(
            walletAddress,
            nftMetadata,
            antiqueData.id
          )

          // 更新古董记录，标记为NFT
          await supabase
            .from('antiques')
            .update({ 
              is_nft: true,
              nft_token_id: tokenId,
              nft_contract_address: blockchainService.getCurrentNetwork(),
              royalty_percentage: royaltyPercentage
            })
            .eq('id', antiqueData.id)

          toast.success(`NFT铸造成功！Token ID: ${tokenId}`)
        } catch (nftError) {
          console.error('NFT铸造失败:', nftError)
          toast.error('NFT铸造失败，但古董已成功发布')
        }
      }

      toast.success('古董发布成功！')
      navigate('/')
    } catch (error) {
      toast.error('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
              <h1 className="text-2xl font-bold text-white">发布古董</h1>
              <p className="text-amber-100 mt-2">分享您的珍贵藏品，连接更多收藏爱好者</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    古董名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="请输入古董名称"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    价格 (￥) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="请输入价格"
                    required
                  />
                </div>
              </div>

              {/* 分类信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    类别
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">选择类别</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年代
                  </label>
                  <select
                    value={formData.era}
                    onChange={(e) => setFormData(prev => ({ ...prev, era: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">选择年代</option>
                    {eras.map(era => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    材质
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="如：瓷器、玉器、铜器等"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  尺寸
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="如：高20cm，直径15cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="请详细描述古董的特征、历史背景、保存状况等"
                />
              </div>

              {/* NFT铸造选项 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">区块链认证 (NFT)</h3>
                      <p className="text-sm text-gray-600">将您的古董铸造为NFT，获得区块链上的唯一身份认证</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mintNFT}
                      onChange={(e) => setMintNFT(e.target.checked)}
                      className="sr-only peer"
                      disabled={!isWalletConnected}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {!isWalletConnected && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        请先连接钱包才能铸造NFT
                      </p>
                    </div>
                  </div>
                )}

                {mintNFT && isWalletConnected && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800">
                          钱包已连接: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        版税比例 (%)
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={royaltyPercentage}
                          onChange={(e) => setRoyaltyPercentage(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-lg font-semibold text-purple-600 min-w-[3rem]">
                          {royaltyPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        每次转售时您将获得 {royaltyPercentage}% 的版税收益
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">NFT铸造说明</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• NFT将在区块链上创建唯一的数字身份</li>
                        <li>• 包含古董的详细信息和图片</li>
                        <li>• 提供不可篡改的所有权证明</li>
                        <li>• 支持在NFT市场上交易</li>
                        <li>• 需要支付少量的区块链网络费用</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  古董图片 (最多5张)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`预览 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="text-center text-gray-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">上传图片</p>
                        <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '发布中...' : mintNFT ? '发布并铸造NFT' : '发布古董'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add slider styles
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #7c3aed;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #7c3aed;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = sliderStyles;
  document.head.appendChild(styleElement);
}