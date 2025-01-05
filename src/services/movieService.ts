import redis from '../config/redis'
import Movie from '../models/Movie'
import { MovieData, UpdateMovieData } from '../types/movieTypes'
import mongoose from 'mongoose'

export async function getMovies() {
  try {
    const cacheKey = 'movies:all'
    const cachedMovies = await redis.get(cacheKey)

    if (cachedMovies) {
      console.log('Returning cached movies')
      return JSON.parse(cachedMovies)
    }

    console.log('Fetching movies from database')
    const movies = await Movie.find({})
      .populate('director', 'fullName genre')
      .exec()

    await redis.set(cacheKey, JSON.stringify(movies), 'EX', 3600)
    return movies
  } catch (error) {
    console.error('Error in getMovies:', error)
    throw error
  }
}

export async function searchMovies(title?: string, genre?: string) {
  const query: { title?: RegExp; genre?: RegExp } = {}
  if (title) query.title = new RegExp(title, 'i')
  if (genre) query.genre = new RegExp(genre, 'i')

  console.log('Searching movies with query:', query)
  return await Movie.find(query)
    .populate('director', 'fullName genre')
    .exec()
}

export async function createMovie(movieData: MovieData) {
  try {
    const movie = await Movie.create(movieData)
    // Populate director details after creation
    const populatedMovie = await Movie.findById(movie._id)
      .populate('director', 'fullName genre')
      .exec()

    // Update director's movies array
    if (movieData.director) {
      await mongoose.model('Director').findByIdAndUpdate(
        movieData.director,
        { $push: { movies: movie._id } },
        { new: true }
      )
    }

    // Invalidate cache after creating new movie
    await redis.del('movies:all')
    await redis.del('directors:all')  // Also invalidate directors cache

    return populatedMovie
  } catch (error) {
    console.error('Error in createMovie:', error)
    throw error
  }
}

export async function updateMovie(id: string, updateData: UpdateMovieData) {
  const movie = await Movie.findByIdAndUpdate(id, updateData, { new: true })
    .populate('director', 'fullName genre')
    .exec()

  // Update director's movies array if director changed
  if (updateData.director) {
    // Remove movie from old director's movies array
    await mongoose.model('Director').updateMany(
      { movies: id },
      { $pull: { movies: id } }
    )

    // Add movie to new director's movies array
    await mongoose.model('Director').findByIdAndUpdate(
      updateData.director,
      { $addToSet: { movies: id } }
    )
  }

  await redis.del('movies:all')
  await redis.del('directors:all')
  return movie
}

export async function deleteMovie(id: string) {
  const movie = await Movie.findById(id)
  if (movie) {
    // Remove movie reference from director
    if (movie.director) {
      await mongoose.model('Director').findByIdAndUpdate(
        movie.director,
        { $pull: { movies: movie._id } }
      )
    }
    await movie.deleteOne()
    await redis.del('movies:all')
    await redis.del('directors:all')
  }
  return movie
}
