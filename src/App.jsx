import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const API_KEY = import.meta.env.VITE_GNEWS_API_KEY
const CATEGORIES = [
  'breaking-news',
  'world',
  'nation',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology',
]

function formatPublishedDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function App() {
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('breaking-news')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!API_KEY) {
      const message = 'Missing API key. Add VITE_GNEWS_API_KEY to your .env file.'
      console.error(message)
      setError(message)
      setLoading(false)
      setArticles([])
      return
    }

    setLoading(true)
    setError('')

    axios
      .get(
        `https://gnews.io/api/v4/top-headlines?topic=${category}&lang=en&max=10&token=${API_KEY}`,
      )
      .then((response) => {
        setArticles(response.data.articles || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        const apiMessage =
          error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          error?.message ||
          'Unknown error'

        setError(
          `Unable to load news articles right now. Please try again. (${apiMessage})`,
        )
        setLoading(false)
      })
  }, [category])

  const filteredArticles = articles.filter((article) => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return true

    const title = article.title?.toLowerCase() || ''
    const description = article.description?.toLowerCase() || ''
    return title.includes(keyword) || description.includes(keyword)
  })

  const featuredArticle = filteredArticles[0]
  const remainingArticles = filteredArticles.slice(1)

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Top US Headlines
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          label="Search by title or description"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">Search</InputAdornment>
              ),
            },
          }}
        />

        <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((option) => (
              <MenuItem key={option} value={option}>
                {option
                  .split('-')
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {filteredArticles.length === 0 ? (
        <Alert severity="info">No articles found.</Alert>
      ) : (
        <Box>
          <Paper
            component={featuredArticle.url ? 'a' : 'div'}
            href={featuredArticle.url || undefined}
            target={featuredArticle.url ? '_blank' : undefined}
            rel={featuredArticle.url ? 'noreferrer' : undefined}
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              minHeight: { xs: 260, md: 360 },
              mb: 3,
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.72) 100%), url(${featuredArticle.image || 'https://via.placeholder.com/1400x800?text=Top+Headline'})`,  
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              textDecoration: 'none',
              cursor: featuredArticle.url ? 'pointer' : 'default',
            }}
          >
            <Box sx={{ p: { xs: 2, md: 4 }, color: 'common.white', maxWidth: 900 }}>
              <Typography variant="overline" sx={{ opacity: 0.95 }}>
                {featuredArticle.source?.name || 'Top Story'}
              </Typography>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1 }}>
                {featuredArticle.title || 'Top headline'}
              </Typography>
              {featuredArticle.url ? (
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  Read featured article
                </Typography>
              ) : null}
            </Box>
          </Paper>

          {remainingArticles.length > 0 ? (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.5 }}>
              {remainingArticles.map((article, index) => (
                <Box component="li" key={`${article.url || article.title}-${index}`}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor:
                        index % 2 === 0 ? 'background.paper' : 'action.hover',
                    }}
                  >
                    {article.url ? (
                      <Link
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                        sx={{ fontWeight: 600 }}
                      >
                        {article.title || 'Untitled article'}
                      </Link>
                    ) : (
                      <Typography sx={{ fontWeight: 600 }}>
                        {article.title || 'Untitled article'}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {(article.source?.name || 'Unknown source') + ' • ' + formatPublishedDate(article.publishedAt)}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">Only one article matched your filters.</Alert>
          )}
        </Box>
      )}
    </Container>
  )
}

export default App
