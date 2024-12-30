import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Movie Management System'
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
              description: 'Rating of the movie'
            },
            streamingLink: {
              type: 'string',
              description: 'Streaming link for the movie'
            }
          }
        }
      },
      securitySchemes: {
        adminAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-role',
          description: 'Set this to "admin" to access protected endpoints',
          example: 'admin'
        }
      }
    },
    security: [{ adminAuth: [] }]
  },
  apis: ['./src/routes/*.ts']
}

const specs = swaggerJsdoc(options)

export default specs
