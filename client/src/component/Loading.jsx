import { useAppContext } from '@/context/AppContext'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { API_PATHS } from '@/utils/api'
import toast from 'react-hot-toast'

const Loading = () => {
  const { navigate, axios } = useAppContext()
  const { search } = useLocation()
  const query = new URLSearchParams(search)
  const nextUrl = query.get('next') || 'my-orders'
  const sessionId = query.get('session_id')

  useEffect(() => {
    const confirmAndRedirect = async () => {
      // If we have a Stripe session_id, confirm it on the backend
      if (sessionId) {
        try {
          await axios.get(`${API_PATHS.ORDER.CONFIRM_STRIPE}?session_id=${sessionId}`)
        } catch (error) {
          // Optional: show a toast but continue navigation
          toast.error(
            error.response?.data?.message || 'Payment confirmation failed, showing latest data.'
          )
        }
      }
      // Navigate after a small delay (spinner UX)
      setTimeout(() => {
        navigate(`/${nextUrl}`)
      }, 2000)
    }

    confirmAndRedirect()
  }, [sessionId, nextUrl, navigate, axios])

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
    </div>
  )
}

export default Loading
