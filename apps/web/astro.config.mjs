// @ts-check

import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

const isGithubActions = process.env.GITHUB_ACTIONS === "true"
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1]

// https://astro.build/config
export default defineConfig({
  site: isGithubActions ? `https://${repoOwner}.github.io` : undefined,
  base: isGithubActions && repoName ? `/${repoName}` : undefined,
  vite: {
    plugins: [tailwindcss()],
    css: {
      transformer: "lightningcss",
    },
  },
  integrations: [react()],
})
