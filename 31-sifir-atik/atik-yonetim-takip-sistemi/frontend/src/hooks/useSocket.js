import { useContext } from 'react'
import { SocketContext } from '../contexts/SocketContext'

export function useSocket() {
  const socket = useContext(SocketContext)
  return socket
}