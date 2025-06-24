import { createContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const socketInstance = io('/', {
        auth: {
          token: localStorage.getItem('token')
        }
      })

      socketInstance.on('connect', () => {
        console.log('Socket connected')
        socketInstance.emit('join-institution', user.institutionId)
      })

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}