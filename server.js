import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = process.env.PORT || 10000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, 'dist')

const ALLOWED_TOPICS = new Set([
  'breaking-news',
  'world',
  'nation',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology',
])

app.get('/api/news', async (req, res) => {
  const token = process.env.GNEWS_API_KEY

  if (!token) {
    return res
      .status(500)
      .json({ message: 'Server is missing GNEWS_API_KEY environment variable.' })
  }

  const requestedCategory = (req.query.category || 'breaking-news').toString()
  const topic = ALLOWED_TOPICS.has(requestedCategory)
    ? requestedCategory
    : 'breaking-news'

  try {
    const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
      params: {
        topic,
        lang: 'en',
        max: 10,
        token,
      },
      timeout: 15000,
    })

    return res.json({ articles: response.data?.articles || [] })
  } catch (error) {
    const status = error?.response?.status || 500
    const apiMessage =
      error?.response?.data?.errors?.[0] ||
      error?.response?.data?.message ||
      error?.message ||
      'Unknown API error'

    return res.status(status).json({ message: apiMessage })
  }
})

app.use(express.static(distPath))

app.get(/.*/, (_req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err.message)
      res.status(500).send('Error loading application')
    }
  })
})

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
  console.log(`Serving static files from: ${distPath}`)
})

server.on('error', (err) => {
  console.error('Server error:', err.message)
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`)
  }
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
