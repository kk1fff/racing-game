import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

type Setter<T> = Dispatch<SetStateAction<T>>

const isBrowser = typeof window !== 'undefined'

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options: { storage?: Storage; serializer?: (value: T) => string; parser?: (value: string) => T } = {},
): [T, Setter<T>] {
  const { storage = isBrowser ? window.localStorage : undefined, serializer = JSON.stringify, parser = JSON.parse } = options

  const readValue = useCallback(() => {
    if (!storage) return initialValue
    try {
      const stored = storage.getItem(key)
      if (stored === null) return initialValue
      return parser(stored)
    } catch (error) {
      console.warn('[usePersistentState] Failed to read key', key, error)
      return initialValue
    }
  }, [initialValue, key, parser, storage])

  const [value, setValue] = useState<T>(readValue)

  useEffect(() => {
    if (!storage) return
    try {
      storage.setItem(key, serializer(value))
    } catch (error) {
      console.warn('[usePersistentState] Failed to write key', key, error)
    }
  }, [key, serializer, storage, value])

  const setPersistedValue: Setter<T> = useCallback(
    (updater) => {
      setValue((prev) => {
        const nextValue = typeof updater === 'function' ? (updater as (prevValue: T) => T)(prev) : updater
        return nextValue
      })
    },
    [],
  )

  return [value, setPersistedValue]
}
