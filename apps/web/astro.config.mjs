// @ts-check

import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

const isGithubActions = process.env.GITHUB_ACTIONS === "true"
const pagesSite = process.env.PUBLIC_GITHUB_PAGES_SITE
const pagesBase = process.env.PUBLIC_GITHUB_PAGES_BASE

// Fallback logic for local and older deploys
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1]

// https://astro.build/config
export default defineConfig({
  site: isGithubActions ? (pagesSite || `https://${repoOwner}.github.io`) : undefined,
  base: isGithubActions ? (pagesBase || (repoName ? `/${repoName}` : undefined)) : undefined,
  vite: {
    plugins: [tailwindcss()],
    css: {
      transformer: "lightningcss",
    },
  },
  integrations: [react()],
})
