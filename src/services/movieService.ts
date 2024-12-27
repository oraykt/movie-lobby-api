import redis from '../config/redis'
import Movie from '../models/Movie'
import { MovieData, UpdateMovieData } from '../types/movieTypes'

export async function getMovies() {
  const cacheKey = 'movies:all'
  const cachedMovies = await redis.get(cacheKey)

  if (cachedMovies) {
    console.log('Returning cached movies')
    return JSON.parse(cachedMovies)
  }

  console.log('Fetching movies from database')
  const movies = await Movie.find()
  await redis.set(cacheKey, JSON.stringify(movies), 'EX', 3600) // Cache for 1 hour

  return movies
}
export async function searchMovies(title?: string, genre?: string) {
  const query: { title?: RegExp; genre?: RegExp } = {}
  if (title) query.title = new RegExp(title, 'i') // Case-insensitive search
  if (genre) query.genre = new RegExp(genre, 'i') // Case-insensitive search

  console.log('Searching movies with query:', query)
  return await Movie.find(query)
}

export async function createMovie(movieData: MovieData) {
  const movie = new Movie(movieData)
  await movie.save()
  await redis.del('movies:all') // Invalidate cache
  return movie
}

export async function updateMovie(id: string, updateData: UpdateMovieData) {
  const movie = await Movie.findByIdAndUpdate(id, updateData, { new: true })
  await redis.del('movies:all') // Invalidate cache
  return movie
}

export async function deleteMovie(id: string) {
  const movie = await Movie.findByIdAndDelete(id)
  if (movie) {
    await redis.del('movies:all') // Invalidate cache
  }
  return movie
}
