import { useEffect, useState } from "react"

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue)

  useEffect(() => {
    const item = window.localStorage.getItem(key)

    if (item) {
      setStoredValue(JSON.parse(item))
    }
  }, [key])

  const setValue = (value, specificKey) => {
    setStoredValue(value)

    window.localStorage.setItem(specificKey ?? key, JSON.stringify(value))
  }

  return [storedValue, setValue]
}

export default useLocalStorage
