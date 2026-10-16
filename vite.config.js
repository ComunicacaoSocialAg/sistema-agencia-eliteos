import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

function metaGraphApiPlugin() {
  return {
    name: 'csag-meta-graph-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/meta', async (req, res) => {
        try {
          const credPath = path.join(os.homedir(), '.gemini', 'config', 'meta_credentials.json')
          let token = process.env.META_ACCESS_TOKEN || ''
          let apiVersion = 'v21.0'
          if (fs.existsSync(credPath)) {
            const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'))
            token = creds.access_token || token
            apiVersion = creds.api_version || apiVersion
          }

          if (!token) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { message: 'Token Meta Graph API ausente em ~/.gemini/config/meta_credentials.json' } }))
            return
          }

          const urlObj = new URL(req.url || '/', 'http://localhost')
          const endpoint = urlObj.searchParams.get('endpoint') || 'me/adaccounts'
          urlObj.searchParams.delete('endpoint')
          urlObj.searchParams.set('access_token', token)

          const cleanEndpoint = endpoint.replace(/^\/+/, '')
          const graphUrl = `https://graph.facebook.com/${apiVersion}/${cleanEndpoint}?${urlObj.searchParams.toString()}`

          const response = await fetch(graphUrl, {
            method: req.method || 'GET',
            headers: { 'Accept': 'application/json' }
          })
          const data = await response.json()

          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { message: err.message || 'Erro ao consultar Meta Graph API' } }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    metaGraphApiPlugin(),
  ],
  build: {
    chunkSizeWarningLimit: 2000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/backups/**', '**/.{idea,git,cache,output,temp}/**'],
  },
})




