import { Request, Response } from 'express'
import Movie from '../models/Movie'

/**
 * Retrieves all movies from the database
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of movies or error message
 */
export const getAllMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const movies = await Movie.find()
    res.json(movies)
  } catch (error) {
    console.error('Error fetching movies:', error)
    res.status(500).json({ message: 'Error fetching movies' })
  }
}

/**
 * Searches for movies by title or genre
 * @param {Request} req - Express request object with query parameter 'q'
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with matching movies or error message
 */
export const searchMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string
    const movies = await Movie.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    })
    res.json(movies)
  } catch (error) {
    console.error('Error searching movies:', error)
    res.status(500).json({ message: 'Error searching movies' })
  }
}

/**
 * Adds a new movie to the database
 * @param {Request} req - Express request object with movie data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created movie or error message
 */
export const addMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie = new Movie(req.body)
    await movie.save()
    res.status(201).json(movie)
  } catch (error) {
    console.error('Error adding movie:', error)
    res.status(400).json({ message: 'Error adding movie' })
  }
}

/**
 * Updates an existing movie's information
 * @param {Request} req - Express request object with movie ID in params and update data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated movie or error message
 */
export const updateMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!movie) {
      res.status(404).json({ message: 'Movie not found' })
      return
    }
    res.json(movie)
  } catch (error) {
    console.error('Error updating movie:', error)
    res.status(400).json({ message: 'Error updating movie' })
  }
}

/**
 * Deletes a movie from the database
 * @param {Request} req - Express request object with movie ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with success message or error message
 */
export const deleteMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id)
    if (!movie) {
      res.status(404).json({ message: 'Movie not found' })
      return
    }
    res.json({ message: 'Movie deleted successfully' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    res.status(400).json({ message: 'Error deleting movie' })
  }
}
