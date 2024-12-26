import request from 'supertest';
import app from '../src/app';
import Movie from '../src/models/Movie';
import mongoose from 'mongoose';

jest.setTimeout(30000); // Database connection takes time

let server: any;

beforeAll((done) => {
  server = app.listen(4000, () => {
    console.log('Test server running on port 4000');
    done();
  });
});

/**
 * Clear the database before each test
 */
beforeEach(async () => {
  await Movie.deleteMany({});
});

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
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Movie');
  });

  /**
   * Test fetching all movies
   */
  it('should get all movies', async () => {
    await Movie.create({
      title: 'Test Movie',
      genre: 'Action',
      rating: 8.5,
      streamingLink: 'https://test.com/movie'
    });

    const response = await request(app).get('/movies');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
}); 