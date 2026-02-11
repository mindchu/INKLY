import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') })

const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT) || 5501
const API_HOST = process.env.API_HOST || 'localhost'
const API_PORT = process.env.API_PORT || 5001

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: `http://${API_HOST}:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
})
