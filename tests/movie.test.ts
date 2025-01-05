import request from 'supertest'
import app from '../src/app'
import Movie from '../src/models/Movie'
import redis from '../src/config/redis'
import { setupTestServer, teardownTestServer } from './setup'

jest.setTimeout(60000)

beforeAll(async () => {
  await setupTestServer(4001)
})

beforeEach(async () => {
  await Movie.deleteMany({})
  await redis.flushall()
})

afterAll(async () => {
  await teardownTestServer()
})

describe('Movie API', () => {
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

  it('should get all movies', async () => {
    await Movie.create({
      title: 'Test Movie',
      genre: 'Action',
      rating: 8.5,
      streamingLink: 'https://test.com/movie',
      director: null
    })

    const response = await request(app).get('/movies')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBe(1)
    expect(response.body[0].title).toBe('Test Movie')
  })

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

  it('should not allow non-admin to create a movie', async () => {
    const response = await request(app)
      .post('/movies')
      .set('x-user-role', 'user')
      .send({
        title: 'Unauthorized Movie',
        genre: 'Comedy',
        rating: 5.0,
        streamingLink: 'https://test.com/unauthorized-movie'
      })

    expect(response.status).toBe(403)
  })

  it('should cache movie data in Redis', async () => {
    await Movie.create({
      title: 'Cached Movie',
      genre: 'Thriller',
      rating: 7.5,
      streamingLink: 'https://test.com/cached-movie',
      director: null
    })

    const response = await request(app).get('/movies')
    expect(response.body.length).toBe(1)

    const cachedMovies = await redis.get('movies:all')
    const movies = JSON.parse(cachedMovies || '[]')
    expect(movies.length).toBe(1)
    expect(movies[0].title).toBe('Cached Movie')
  })

  it('should invalidate cache after movie deletion', async () => {
    const movie = await Movie.create({
      title: 'To Be Cached',
      genre: 'Drama',
      rating: 6.5,
      streamingLink: 'https://test.com/to-be-cached'
    })

    await request(app).get('/movies')
    await request(app)
      .delete(`/movies/${movie._id}`)
      .set('x-user-role', 'admin')

    const cachedMovies = await redis.get('movies:all')
    const movies = JSON.parse(cachedMovies || '[]')
    expect(movies).toEqual([])
  })
})
