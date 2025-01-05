import request from 'supertest'
import app from '../src/app'
import Director from '../src/models/Director'
import Movie from '../src/models/Movie'
import redis from '../src/config/redis'
import { setupTestServer, teardownTestServer } from './setup'

jest.setTimeout(60000)

beforeAll(async () => {
  await setupTestServer(4002)
})

beforeEach(async () => {
  await Director.deleteMany({})
  await Movie.deleteMany({})
  await redis.flushall()
})

afterAll(async () => {
  await teardownTestServer()
})

describe('Director API', () => {
  it('should create a new director', async () => {
    const response = await request(app)
      .post('/directors')
      .set('x-user-role', 'admin')
      .send({
        fullName: 'Christopher Nolan',
        genre: 'Sci-Fi',
        movies: []
      })

    expect(response.status).toBe(201)
    expect(response.body.fullName).toBe('Christopher Nolan')
    expect(response.body.genre).toBe('Sci-Fi')
  })

  it('should get all directors', async () => {
    await Director.create({
      fullName: 'Martin Scorsese',
      genre: 'Drama',
      movies: []
    })

    const response = await request(app).get('/directors')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].fullName).toBe('Martin Scorsese')
  })

  it('should search directors by name and genre', async () => {
    await Director.create([
      { fullName: 'Quentin Tarantino', genre: 'Action' },
      { fullName: 'Steven Spielberg', genre: 'Adventure' }
    ])

    const response = await request(app)
      .get('/directors/search')
      .query({ fullName: 'Tarantino', genre: 'Action' })

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].fullName).toBe('Quentin Tarantino')
  })

  it('should update a director', async () => {
    const director = await Director.create({
      fullName: 'Old Name',
      genre: 'Drama',
      movies: []
    })

    const response = await request(app)
      .put(`/directors/${director._id}`)
      .set('x-user-role', 'admin')
      .send({
        fullName: 'Updated Name',
        genre: 'Comedy'
      })

    expect(response.status).toBe(200)
    expect(response.body.fullName).toBe('Updated Name')
    expect(response.body.genre).toBe('Comedy')
  })

  it('should delete a director', async () => {
    const director = await Director.create({
      fullName: 'To Be Deleted',
      genre: 'Horror',
      movies: []
    })

    const response = await request(app)
      .delete(`/directors/${director._id}`)
      .set('x-user-role', 'admin')

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Director deleted successfully')
    expect(await Director.findById(director._id)).toBeNull()
  })

  it('should not allow non-admin to create a director', async () => {
    const response = await request(app)
      .post('/directors')
      .set('x-user-role', 'user')
      .send({
        fullName: 'Unauthorized Director',
        genre: 'Drama'
      })

    expect(response.status).toBe(403)
  })

  it('should create a director with movies and populate movies in get request', async () => {
    const movie = await Movie.create({
      title: 'Inception',
      genre: 'Sci-Fi',
      rating: 9.0,
      streamingLink: 'https://test.com/inception'
    })

    const createResponse = await request(app)
      .post('/directors')
      .set('x-user-role', 'admin')
      .send({
        fullName: 'Christopher Nolan',
        genre: 'Sci-Fi',
        movies: [movie._id.toString()]
      })

    expect(createResponse.status).toBe(201)

    const getResponse = await request(app).get('/directors')
    expect(getResponse.status).toBe(200)
    expect(getResponse.body[0].movies).toBeDefined()
    expect(getResponse.body[0].movies.length).toBe(1)
    expect(getResponse.body[0].movies[0]._id.toString()).toBe(movie._id.toString())
  })

  it('should cache director data in Redis', async () => {
    await request(app)
      .post('/directors')
      .set('x-user-role', 'admin')
      .send({
        fullName: 'Cached Director',
        genre: 'Action',
        movies: []
      })

    const response = await request(app).get('/directors')
    expect(response.status).toBe(200)

    const cachedDirectors = await redis.get('directors:all')
    expect(cachedDirectors).not.toBeNull()

    const directors = JSON.parse(cachedDirectors || '[]')
    expect(directors.length).toBe(1)
    expect(directors[0].fullName).toBe('Cached Director')
  })

  it('should invalidate cache after director update', async () => {
    const director = await Director.create({
      fullName: 'Original Name',
      genre: 'Drama',
      movies: []
    })

    await request(app).get('/directors')
    await request(app)
      .put(`/directors/${director._id}`)
      .set('x-user-role', 'admin')
      .send({
        fullName: 'Updated Name'
      })

    const cachedDirectors = await redis.get('directors:all')
    expect(cachedDirectors).toBeNull()
  })
})
