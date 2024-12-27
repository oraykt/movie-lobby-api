import request from 'supertest'
import app from '../src/app'
import Movie from '../src/models/Movie'
import mongoose from 'mongoose'
import * as http from 'http'
import redis from '../src/config/redis'

jest.setTimeout(60000) // Increase timeout to 60 seconds for all tests

let server: http.Server

beforeAll((done) => {
  const TEST_PORT = 4001
  server = app.listen(TEST_PORT, () => {
    console.log(`Test server running on port ${TEST_PORT}`)
    done()
  })
})

/**
 * Clear the database and Redis cache before each test
 */
beforeEach(async () => {
  await Movie.deleteMany({})
  await redis.flushall()
})

/**
 * Movie API test suite
 * @group integration
 */
describe('Movie API', () => {
  /**
   * Test movie creation
   */
  it('should create a new movie', async () => {
    const response = await request(app)
      .post('/movies')
      .set('x-user-role', 'admin')
      .send({
        title: 'Test Movie',
        genre: 'Action',
        rating: 8.5,
        streamingLink: 'https://test.com/movie'
      })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe('Test Movie')
  })

  /**
   * Test fetching all movies
   */
  it('should get all movies', async () => {
    await Movie.create({
      title: 'Test Movie',
      genre: 'Action',
      rating: 8.5,
      streamingLink: 'https://test.com/movie'
    })

    const response = await request(app).get('/movies')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
  })

  /**
   * Test updating a movie
   */
  it('should update a movie', async () => {
    const movie = await Movie.create({
      title: 'Old Title',
      genre: 'Action',
      rating: 7.0,
      streamingLink: 'https://test.com/old-movie'
    })

    const response = await request(app)
      .put(`/movies/${movie._id}`)
      .set('x-user-role', 'admin')
      .send({
        title: 'Updated Title',
        rating: 8.0
      })

    expect(response.status).toBe(200)
    expect(response.body.title).toBe('Updated Title')
    expect(response.body.rating).toBe(8.0)
  })

  /**
   * Test deleting a movie
   */
  it('should delete a movie', async () => {
    const movie = await Movie.create({
      title: 'To Be Deleted',
      genre: 'Drama',
      rating: 6.5,
      streamingLink: 'https://test.com/delete-movie'
    })

    const response = await request(app)
      .delete(`/movies/${movie._id}`)
      .set('x-user-role', 'admin')

    expect(response.status).toBe(200)

    const deletedMovie = await Movie.findById(movie._id)
    expect(deletedMovie).toBeNull()
  })

  /**
   * Test unauthorized access
   */
  it('should not allow non-admin to create a movie', async () => {
    const response = await request(app)
      .post('/movies')
      .set('x-user-role', 'user') // Non-admin role
      .send({
        title: 'Unauthorized Movie',
        genre: 'Comedy',
        rating: 5.0,
        streamingLink: 'https://test.com/unauthorized-movie'
      })

    expect(response.status).toBe(403) // Expecting forbidden status
  })

  /**
   * Test Redis caching
   */
  it('should cache movie data in Redis', async () => {
    // Create a movie
    await request(app)
      .post('/movies')
      .set('x-user-role', 'admin')
      .send({
        title: 'Cached Movie',
        genre: 'Thriller',
        rating: 7.5,
        streamingLink: 'https://test.com/cached-movie'
      })

    // Fetch movies to trigger caching
    const response = await request(app).get('/movies')
    console.log('Response status:', response.status)
    console.log('Response body:', response.body)

    // Check if the data is cached
    const cachedMovies = await redis.get('movies:all')
    console.log('Cached movies:', cachedMovies)
    expect(cachedMovies).not.toBeNull()

    const movies = JSON.parse(cachedMovies || '[]')
    expect(movies.length).toBe(1)
    expect(movies[0].title).toBe('Cached Movie')
  })

  /**
   * Test Redis cache invalidation
   */
  it('should invalidate cache after movie deletion', async () => {
    const movie = await Movie.create({
      title: 'To Be Cached',
      genre: 'Drama',
      rating: 6.5,
      streamingLink: 'https://test.com/to-be-cached'
    })

    // Fetch movies to trigger caching
    await request(app).get('/movies')

    // Delete the movie
    await request(app)
      .delete(`/movies/${movie._id}`)
      .set('x-user-role', 'admin')

    // Check if the cache is invalidated
    const cachedMovies = await redis.get('movies:all')
    expect(cachedMovies).toBeNull()
  })
})

afterAll(async () => {
  await mongoose.connection.close()
  server.close()
  await redis.quit()
})
