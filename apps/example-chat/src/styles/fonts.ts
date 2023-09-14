import { Inconsolata, Inter, Zilla_Slab } from "next/font/google"

export const zillaBold = Zilla_Slab({
  weight: "700",
  variable: "--font-display",
  subsets: ["latin"]
})

export const inter = Inter({
  variable: "--font-default",
  subsets: ["latin"]
})

export const inconsolata = Inconsolata({
  variable: "--font-mono",
  subsets: ["latin"]
})

export const defaultFontMapper = {
  default: inter.variable,
  serif: zillaBold.variable,
  mono: inconsolata.variable
}
