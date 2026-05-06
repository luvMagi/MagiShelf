import React, { createContext, useCallback, useEffect, useState } from 'react'
import { MagiShelfStore, defaultStore } from '../../../shared/types/store'
import { getAllData, saveAllData } from '../services/shelfService'

type StoreContextValue = {
  store: MagiShelfStore
  loading: boolean
  updateStore: (updater: (prev: MagiShelfStore) => MagiShelfStore) => Promise<void>
}

export const StoreContext = createContext<StoreContextValue>({
  store: defaultStore,
  loading: true,
  updateStore: async () => {}
})

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<MagiShelfStore>(defaultStore)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllData().then((data) => {
      setStore(data)
      setLoading(false)
    })
  }, [])

  const updateStore = useCallback(
    async (updater: (prev: MagiShelfStore) => MagiShelfStore) => {
      const next = updater(store)
      setStore(next)
      await saveAllData(next)
    },
    [store]
  )

  return (
    <StoreContext.Provider value={{ store, loading, updateStore }}>
      {children}
    </StoreContext.Provider>
  )
}
