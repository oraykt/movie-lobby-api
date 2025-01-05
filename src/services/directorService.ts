import redis from '../config/redis'
import Director from '../models/Director'
import { DirectorData, UpdateDirectorData } from '../types/directorTypes'

const CACHE_DURATION = 3600 // 1 hour in seconds
const DIRECTORS_CACHE_KEY = 'directors:all'

function generateSearchCacheKey(fullName?: string, genre?: string): string {
  return `directors:search:${fullName || ''}:${genre || ''}`
}

export async function getDirectors() {
  try {
    const cachedDirectors = await redis.get(DIRECTORS_CACHE_KEY)
    if (cachedDirectors) {
      console.log('Returning cached directors')
      return JSON.parse(cachedDirectors)
    }

    console.log('Fetching directors from database')
    const directors = await Director.find().populate('movies')
    await redis.set(DIRECTORS_CACHE_KEY, JSON.stringify(directors), 'EX', CACHE_DURATION)
    return directors
  } catch (error) {
    console.error('Error in getDirectors:', error)
    throw error
  }
}

export async function searchDirectors(fullName?: string, genre?: string) {
  try {
    const cacheKey = generateSearchCacheKey(fullName, genre)
    const cachedResults = await redis.get(cacheKey)

    if (cachedResults) {
      console.log('Returning cached search results')
      return JSON.parse(cachedResults)
    }

    const query: { fullName?: RegExp; genre?: RegExp } = {}
    if (fullName) query.fullName = new RegExp(fullName, 'i')
    if (genre) query.genre = new RegExp(genre, 'i')

    const directors = await Director.find(query).populate('movies')
    await redis.set(cacheKey, JSON.stringify(directors), 'EX', CACHE_DURATION)
    return directors
  } catch (error) {
    console.error('Error in searchDirectors:', error)
    throw error
  }
}

export async function createDirector(directorData: DirectorData) {
  try {
    const director = new Director(directorData)
    await director.save()
    await invalidateDirectorCache()
    return director
  } catch (error) {
    console.error('Error in createDirector:', error)
    throw error
  }
}

export async function updateDirector(id: string, updateData: UpdateDirectorData) {
  try {
    const director = await Director.findByIdAndUpdate(id, updateData, { new: true })
    await invalidateDirectorCache()
    return director
  } catch (error) {
    console.error('Error in updateDirector:', error)
    throw error
  }
}

export async function deleteDirector(id: string) {
  try {
    const director = await Director.findByIdAndDelete(id)
    if (director) {
      await invalidateDirectorCache()
    }
    return director
  } catch (error) {
    console.error('Error in deleteDirector:', error)
    throw error
  }
}

async function invalidateDirectorCache() {
  try {
    // Get all keys matching the pattern 'directors:*'
    const keys = await redis.keys('directors:*')
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Error invalidating director cache:', error)
  }
}
