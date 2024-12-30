import express from 'express'
import { getMovies, createMovie, updateMovie, deleteMovie, searchMovies } from '../services/movieService'

const router = express.Router()

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     description: Retrieve a list of all movies from the database
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of movies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Server error while fetching movies
 */
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

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search movies
 *     description: Search movies by title and/or genre
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Movie title to search for
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Movie genre to search for
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Server error while searching movies
 */
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

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     description: Add a new movie to the database (Admin only)
 *     tags: [Movies]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - genre
 *               - rating
 *               - streamingLink
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Matrix"
 *               genre:
 *                 type: string
 *                 example: "Sci-Fi"
 *               rating:
 *                 type: number
 *                 example: 8.7
 *               streamingLink:
 *                 type: string
 *                 example: "https://example.com/watch/matrix"
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       401:
 *         description: Unauthorized - Missing admin header
 *       403:
 *         description: Forbidden - Invalid admin credentials
 *       500:
 *         description: Server error while creating movie
 */
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

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update a movie
 *     description: Update an existing movie's information (Admin only)
 *     tags: [Movies]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Movie Title"
 *               genre:
 *                 type: string
 *                 example: "Action"
 *               rating:
 *                 type: number
 *                 example: 9.0
 *               streamingLink:
 *                 type: string
 *                 example: "https://example.com/watch/updated-movie"
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       401:
 *         description: Unauthorized - Missing admin header
 *       403:
 *         description: Forbidden - Invalid admin credentials
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Server error while updating movie
 */
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

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete a movie
 *     description: Delete a movie from the database (Admin only)
 *     tags: [Movies]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       401:
 *         description: Unauthorized - Missing admin header
 *       403:
 *         description: Forbidden - Invalid admin credentials
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Server error while deleting movie
 */
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
