import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AuthForm } from './components/AuthForm'
import { AuthProvider } from './components/AuthProvider'
import { useEffect } from 'react'
import { ChatPage } from './pages/ChatPage'
import { PublishPage } from './pages/PublishPage'
import { FriendsPage } from './pages/FriendsPage'
import { HomePage } from './pages/HomePage'
import { TripWeaverPage } from './pages/TripWeaverPage'

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function AuthRoute() {
  const { isAuthenticated, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : <AuthForm />
}

function LoginPage() {
  return <AuthForm isLogin={true} />
}

function RegisterPage() {
  return <AuthForm isLogin={false} />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthProvider><Outlet /></AuthProvider>,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <HomePage />,
          },
          {
            path: 'publish',
            element: <PublishPage />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
          },
          {
            path: 'profile',
            element: <div>个人中心</div>,
          },
          {
            path: 'friends',
            element: <FriendsPage />,
          },
          {
            path: 'tripweaver',
            element: <TripWeaverPage />,
          },
          {
            path: 'my-antiques',
            element: <div>我的古董</div>,
          },
          {
            path: 'antique/:id',
            element: <div>古董详情</div>,
          },
        ],
      },
    ],
  },
])
