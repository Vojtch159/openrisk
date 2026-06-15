import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  compatibilityDate: '2026-06-11',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/eslint'],
  vite: {
    plugins: [tailwindcss()],
  },
  alias: {
    '#openrisk': fileURLToPath(new URL('./shared/openrisk.ts', import.meta.url)),
  },
  typescript: {
    typeCheck: false,
  },
  app: {
    head: {
      title: 'OpenRisk - Neutral DeFi risk intelligence',
      meta: [
        {
          name: 'description',
          content: 'A neutral, open source registry of Ethereum DeFi risk feed coverage, governance facts, and data provenance.',
        },
        { name: 'theme-color', content: '#fbfaf6' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script: [{
        innerHTML: "try{document.documentElement.classList.toggle('dark',localStorage.getItem('openrisk-theme')==='dark')}catch(e){}",
      }],
    },
  },
  nitro: {
    preset: 'vercel-static',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/feeds', '/info', '/contribute', '/about', '/faq'],
    },
  },
  build: {
    transpile: ['@lucide/vue'],
  },
});
