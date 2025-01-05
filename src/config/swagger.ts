import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie and Director API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Movie and Director Management System'
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Movie: {
          type: 'object',
          required: ['title', 'genre', 'rating', 'streamingLink'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated movie ID'
            },
            title: {
              type: 'string',
              description: 'Title of the movie'
            },
            genre: {
              type: 'string',
              description: 'Genre of the movie'
            },
            rating: {
              type: 'number',
              description: 'Rating of the movie (0-10)'
            },
            streamingLink: {
              type: 'string',
              description: 'Streaming link for the movie'
            },
            director: {
              type: 'string',
              description: 'Reference to director ID',
              nullable: true
            }
          }
        },
        Director: {
          type: 'object',
          required: ['fullName', 'genre'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated director ID'
            },
            fullName: {
              type: 'string',
              description: "The director's full name"
            },
            genre: {
              type: 'string',
              description: "The director's preferred genre"
            },
            movies: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Movie'
              },
              description: 'List of movies directed by this director'
            }
          }
        }
      },
      securitySchemes: {
        adminAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-role',
          description: 'Set this to "admin" to access protected endpoints'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
}

const specs = swaggerJsdoc(options)

export default specs
