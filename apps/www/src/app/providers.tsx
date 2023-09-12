"use client"

import { ReactNode, createContext, useState } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { Toaster } from "sonner"

export const AppContext = createContext({
  setData: (data: unknown) => {
    return data
  },
  data: {}
})

const ToasterProvider = () => {
  const { theme } = useTheme() as {
    theme: "light" | "dark" | "system"
  }
  return <Toaster theme={theme} />
}

export default function Providers({ children }: { children: ReactNode }) {
  const [data, setData] = useState({})

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppContext.Provider
        value={{
          setData,
          data
        }}
      >
        <ToasterProvider />
        <div>{children}</div>
      </AppContext.Provider>
    </ThemeProvider>
  )
}
