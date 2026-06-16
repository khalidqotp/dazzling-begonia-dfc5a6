import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@vercel/tanstack-start' // 1. استيراد بلجن فيرسيل بدلاً من نيتلفاي

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    vercel(), // 2. تغيير البلجن هنا لفيرسيل
    tanstackStart(),
    viteReact(),
  ],
})

export default config
