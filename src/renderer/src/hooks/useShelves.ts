import { useContext } from 'react'
import { StoreContext } from '../context/StoreContext'

export function useShelves() {
  const { store, updateStore } = useContext(StoreContext)
  return { shelves: store.shelves, store, updateStore }
}
