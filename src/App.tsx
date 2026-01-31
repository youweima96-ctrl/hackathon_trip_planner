import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
          },
        }}
      />
    </>
  )
}
