import { useState, useEffect } from 'react'
import { AntiqueList } from '../components/AntiqueList'
import { useAuthStore } from '../stores/authStore'
import { Link, useNavigate } from 'react-router-dom'
import { User, MessageCircle, Plus, LogOut, Settings, Package } from 'lucide-react'

export function HomePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">古</span>
              </div>
              <span className="text-xl font-bold text-amber-800">古董交易平台</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md transition-colors"
              >
                首页
              </Link>
              <Link
                to="/chat"
                className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md transition-colors"
              >
                聊天
              </Link>
              <Link
                to="/friends"
                className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md transition-colors"
              >
                好友
              </Link>
              <Link
                to="/tripweaver"
                className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md transition-colors"
              >
                TripWeaver
              </Link>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium">{user.nickname}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        个人中心
                      </Link>
                      <Link
                        to="/my-antiques"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        我的古董
                      </Link>
                      <Link
                        to="/publish"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        发布古董
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-amber-600 hover:text-amber-700 px-3 py-2 rounded-md transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">
            发现珍贵古董，连接收藏爱好者
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            专业的古董展示交易平台，让每一件藏品都能找到它的有缘人
          </p>
          
          {user && (
            <Link
              to="/publish"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-lg font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              发布我的古董
            </Link>
          )}
        </div>

        <AntiqueList />
      </main>

      {/* 页脚 */}
      <footer className="bg-amber-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-200">
            © 2024 古董交易平台. 传承文化，连接古今
          </p>
        </div>
      </footer>
    </div>
  )
}
