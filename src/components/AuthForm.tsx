import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  isLogin?: boolean
  onSuccess?: () => void
}

export function AuthForm({ isLogin = true, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(isLogin)
  
  const { login, register, loading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    try {
      if (isLoginMode) {
        await login(email, password)
      } else {
        await register(email, password, nickname)
      }
      onSuccess?.()
    } catch (error) {
      console.error('认证错误:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {isLoginMode ? '登录古董交易平台' : '注册新账户'}
            </h2>
            <p className="text-amber-100 text-center mt-2">
              {isLoginMode ? '欢迎回来，继续您的古董之旅' : '加入我们，开启收藏之旅'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            </div>
            
            {!isLoginMode && (
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                  昵称
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="请输入昵称"
                    required
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 px-4 rounded-md hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLoginMode ? '登录中...' : '注册中...'}
                </div>
              ) : (
                isLoginMode ? '登录' : '注册'
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode)
                  clearError()
                  setEmail('')
                  setPassword('')
                  setNickname('')
                }}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                {isLoginMode ? '没有账户？立即注册' : '已有账户？立即登录'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}