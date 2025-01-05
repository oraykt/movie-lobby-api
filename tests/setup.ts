import app from '../src/app'
import mongoose from 'mongoose'
import * as http from 'http'
import redis from '../src/config/redis'

let server: http.Server

// Suppress console logs during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { })
  jest.spyOn(console, 'error').mockImplementation(() => { })
})

// Restore console logs after tests
afterAll(() => {
  jest.restoreAllMocks()
})

export const setupTestServer = (port: number): Promise<http.Server> => {
  return new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Test server running on port ${port}`)
      resolve(server)
    })
  })
}

export const teardownTestServer = async (): Promise<void> => {
  await mongoose.connection.close()
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  await redis.quit()
}
