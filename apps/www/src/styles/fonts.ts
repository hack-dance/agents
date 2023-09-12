import { Inconsolata, Inter, Zilla_Slab } from "next/font/google"
import localFont from "next/font/local"

export const blunt_outline = localFont({
  src: "./sp-blunt-outline.woff2",
  variable: "--font-outline"
})

export const blunt = localFont({
  src: "./sp-blunt-regular.woff2",
  variable: "--font-blunt"
})

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
  mono: inconsolata.variable,
  outline: blunt_outline.variable,
  blunt: blunt.variable
}
