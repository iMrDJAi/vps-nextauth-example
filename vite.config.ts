import 'dotenv/config'
import path from 'path'
import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr/plugin'
import { defineConfig } from 'vite'


const config = defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      ssr()
    ],
    resolve: {
      alias: [
        {
          find: mode === 'production' ? './index.scss?url' : './index.scss',
          replacement: path.resolve(__dirname, 'noop.ts')
        }
      ]
    },
    define: {
      'process.env.NEXTAUTH_URL': JSON.stringify(process.env.NEXTAUTH_URL)
    }
  }
})

export default config
