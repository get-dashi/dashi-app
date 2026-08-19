'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface UserList {
  id: string
  name: string
  venueIds: string[]
  createdAt: number
  sourceListId?: string
  published?: boolean
  publishedAt?: number
  emoji?: string
}

interface UserListsContextType {
  userLists: UserList[]
  createList: (name: string, venueIds: string[], opts?: { sourceListId?: string; emoji?: string }) => UserList
  deleteList: (id: string) => void
  addVenueToList: (listId: string, venueId: string) => void
  removeVenueFromList: (listId: string, venueId: string) => void
  publishList: (id: string) => void
  unpublishList: (id: string) => void
  hasListForSource: (sourceListId: string) => boolean
  getListBySource: (sourceListId: string) => UserList | undefined
}

const LS_KEY = 'dashi_user_lists'
const UserListsContext = createContext<UserListsContextType | null>(null)

export function UserListsProvider({ children }: { children: ReactNode }) {
  const [userLists, setUserLists] = useState<UserList[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
  })

  const createList = useCallback((name: string, venueIds: string[], opts?: { sourceListId?: string; emoji?: string }): UserList => {
    const list: UserList = { id: `ul_${Date.now()}`, name, venueIds, createdAt: Date.now(), sourceListId: opts?.sourceListId, emoji: opts?.emoji }
    setUserLists(prev => { const next = [...prev, list]; localStorage.setItem(LS_KEY, JSON.stringify(next)); return next })
    return list
  }, [])

  const deleteList = useCallback((id: string) => setUserLists(prev => { const next = prev.filter(l => l.id !== id); localStorage.setItem(LS_KEY, JSON.stringify(next)); return next }), [])

  const addVenueToList = useCallback((listId: string, venueId: string) =>
    setUserLists(prev => { const next = prev.map(l => l.id === listId && !l.venueIds.includes(venueId) ? { ...l, venueIds: [...l.venueIds, venueId] } : l); localStorage.setItem(LS_KEY, JSON.stringify(next)); return next }), [])

  const removeVenueFromList = useCallback((listId: string, venueId: string) =>
    setUserLists(prev => { const next = prev.map(l => l.id === listId ? { ...l, venueIds: l.venueIds.filter(id => id !== venueId) } : l); localStorage.setItem(LS_KEY, JSON.stringify(next)); return next }), [])

  const publishList = useCallback((id: string) =>
    setUserLists(prev => { const next = prev.map(l => l.id === id ? { ...l, published: true, publishedAt: Date.now() } : l); localStorage.setItem(LS_KEY, JSON.stringify(next)); return next }), [])

  const unpublishList = useCallback((id: string) =>
    setUserLists(prev => { const next = prev.map(l => l.id === id ? { ...l, published: false, publishedAt: undefined } : l); localStorage.setItem(LS_KEY, JSON.stringify(next)); return next }), [])

  const hasListForSource = useCallback((sourceListId: string) => userLists.some(l => l.sourceListId === sourceListId), [userLists])
  const getListBySource = useCallback((sourceListId: string) => userLists.find(l => l.sourceListId === sourceListId), [userLists])

  return (
    <UserListsContext.Provider value={{ userLists, createList, deleteList, addVenueToList, removeVenueFromList, publishList, unpublishList, hasListForSource, getListBySource }}>
      {children}
    </UserListsContext.Provider>
  )
}

export function useUserLists() {
  const ctx = useContext(UserListsContext)
  if (!ctx) throw new Error('useUserLists must be used within UserListsProvider')
  return ctx
}
