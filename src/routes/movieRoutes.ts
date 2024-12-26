import { Router } from 'express';
import { getAllMovies, searchMovies, addMovie, updateMovie, deleteMovie } from '../controllers/movieController';
import { isAdmin } from '../middleware/authMiddleware';

/**
 * Express router for movie-related endpoints
 * @constant router
 */
const router = Router();

/**
 * @route GET /movies
 * @description Get all movies in the lobby
 * @access Public
 */
router.get('/movies', getAllMovies);

/**
 * @route GET /search
 * @description Search movies by title or genre
 * @access Public
 */
router.get('/search', searchMovies);

/**
 * @route POST /movies
 * @description Add a new movie
 * @access Admin only
 */
router.post('/movies', isAdmin, addMovie);

/**
 * @route PUT /movies/:id
 * @description Update an existing movie
 * @access Admin only
 */
router.put('/movies/:id', isAdmin, updateMovie);

/**
 * @route DELETE /movies/:id
 * @description Delete a movie
 * @access Admin only
 */
router.delete('/movies/:id', isAdmin, deleteMovie);

export default router; 