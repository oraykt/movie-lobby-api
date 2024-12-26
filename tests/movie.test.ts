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

  /**
   * Test updating a movie
   */
  it('should update a movie', async () => {
    const movie = await Movie.create({
      title: 'Old Title',
      genre: 'Action',
      rating: 7.0,
      streamingLink: 'https://test.com/old-movie'
    });

    const response = await request(app)
      .put(`/movies/${movie._id}`)
      .set('x-user-role', 'admin')
      .send({
        title: 'Updated Title',
        rating: 8.0
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Title');
    expect(response.body.rating).toBe(8.0);
  });

  /**
   * Test deleting a movie
   */
  it('should delete a movie', async () => {
    const movie = await Movie.create({
      title: 'To Be Deleted',
      genre: 'Drama',
      rating: 6.5,
      streamingLink: 'https://test.com/delete-movie'
    });

    const response = await request(app)
      .delete(`/movies/${movie._id}`)
      .set('x-user-role', 'admin');

    expect(response.status).toBe(200);

    const deletedMovie = await Movie.findById(movie._id);
    expect(deletedMovie).toBeNull();
  });

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
      });

    expect(response.status).toBe(403); // Expecting forbidden status
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
}); 