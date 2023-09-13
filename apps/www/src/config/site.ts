export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "hack-dance/agents",
  url: "https://agents.hack.dance",
  description: "",
  og: {
    title: "Hack Dance Agents",
    description: ""
  },
  links: {
    twitter: {
      url: "https://twitter.com/dimitrikennedy",
      text: "@dimitrikennedy"
    },
    github: {
      url: "https://github.com/hack-dance/agents",
      text: "Github"
    }
  },
  mainNav: [
    {
      label: "Documentation",
      url: "/docs/getting-started"
    },
    {
      label: "Examples",
      url: "/examples"
    }
  ]
}
