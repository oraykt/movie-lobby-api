import express from 'express'
import { getMovies, createMovie, updateMovie, deleteMovie, searchMovies } from '../services/movieService'

const router = express.Router()

router.get('/movies', async (req, res) => {
  console.log('GET /movies - Query:', JSON.stringify(req.query))
  try {
    const movies = await getMovies()
    res.status(200).json(movies)
  } catch (error) {
    console.error('Error fetching movies:', error)
    res.status(500).json({ error: 'Failed to fetch movies' })
  }
})

router.get('/search', async (req, res) => {
  console.log('GET /search - Query:', JSON.stringify(req.query))
  const { title, genre } = req.query
  try {
    const movies = await searchMovies(title as string, genre as string)
    res.status(200).json(movies)
  } catch (error) {
    console.error('Error searching movies:', error)
    res.status(500).json({ error: 'Failed to search movies' })
  }
})

router.post('/movies', async (req, res) => {
  console.log('POST /movies - Body:', JSON.stringify(req.body))
  if (req.headers['x-user-role'] !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  try {
    const movie = await createMovie(req.body)
    res.status(201).json(movie)
  } catch (error) {
    console.error('Error creating movie:', error)
    res.status(500).json({ error: 'Failed to create movie' })
  }
})

router.put('/movies/:id', async (req, res) => {
  console.log(`PUT /movies/${req.params.id} - Body:`, JSON.stringify(req.body))
  try {
    const movie = await updateMovie(req.params.id, req.body)
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' })
    }
    res.status(200).json(movie)
  } catch (error) {
    console.error('Error updating movie:', error)
    res.status(500).json({ error: 'Failed to update movie' })
  }
})

router.delete('/movies/:id', async (req, res) => {
  console.log(`DELETE /movies/${req.params.id}`)
  try {
    const movie = await deleteMovie(req.params.id)
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' })
    }
    res.status(200).json({ message: 'Movie deleted successfully' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    res.status(500).json({ error: 'Failed to delete movie' })
  }
})

export default router
