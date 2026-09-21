// packages/tour/scripts/serve.mjs
//
// Minimal static file server for local preview of the built tour.
// Usage: pnpm run build && pnpm run serve   (then open http://localhost:4321)
//
// Replaces `slidev` / `vite preview`. It reproduces the two behaviours the
// production host provides, so what you see locally is what ships:
//   1. static assets are served from dist/
//   2. extensionless paths that do not resolve to a file fall back to
//      index.html (the SPA rule implemented in functions/_middleware.js)

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')
const port = Number(process.env.PORT || 4321)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

async function tryFile(path) {
  try {
    const s = await stat(path)
    if (s.isDirectory()) {
      const idx = join(path, 'index.html')
      const si = await stat(idx)
      if (si.isFile()) return idx
      return null
    }
    return path
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    // Decode so paths with %20 etc. resolve.
    let pathname = decodeURIComponent(url.pathname)

    // Directory-ish paths get index.html appended by tryFile.
    let target = await tryFile(join(distDir, pathname))

    // SPA fallback: no extension and nothing on disk -> index.html
    if (!target && !extname(pathname)) {
      target = await tryFile(join(distDir, 'index.html'))
    }

    if (!target) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
      res.end('<h1>404</h1>')
      return
    }

    const body = await readFile(target)
    res.writeHead(200, {
      'content-type': TYPES[extname(target)] || 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('500 ' + err.message)
  }
})

server.listen(port, () => {
  console.log(`[serve] tour on http://localhost:${port}`)
  console.log(`[serve] one document for all viewports; resize to switch layout`)
})