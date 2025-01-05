import express from 'express'
import { getDirectors, createDirector, updateDirector, deleteDirector, searchDirectors } from '../services/directorService'
import { isAdmin } from '../middleware/authMiddleware'

const router = express.Router()

/**
 * @swagger
 * /directors:
 *   get:
 *     summary: Get all directors
 *     tags: [Directors]
 *     responses:
 *       200:
 *         description: List of directors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Director'
 *       500:
 *         description: Server error while fetching directors
 */
router.get('/', async (req, res) => {
  console.log('GET /directors - Query:', JSON.stringify(req.query))
  try {
    const directors = await getDirectors()
    console.log(`Found ${directors.length} directors`)
    res.status(200).json(directors)
  } catch (error) {
    console.error('Error fetching directors:', error)
    res.status(500).json({ error: 'Failed to fetch directors' })
  }
})

/**
 * @swagger
 * /directors/search:
 *   get:
 *     summary: Search directors by name and genre
 *     tags: [Directors]
 *     parameters:
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Director's full name to search for
 *         example: "Nolan"
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Director's genre to search for
 *         example: "Sci-Fi"
 *     responses:
 *       200:
 *         description: List of directors matching search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Director'
 *       500:
 *         description: Server error while searching directors
 */
router.get('/search', async (req, res) => {
  console.log('GET /directors/search - Query:', JSON.stringify(req.query))
  const { fullName, genre } = req.query
  try {
    const directors = await searchDirectors(fullName as string, genre as string)
    console.log(`Found ${directors.length} directors matching search criteria`)
    res.status(200).json(directors)
  } catch (error) {
    console.error('Error searching directors:', error)
    res.status(500).json({ error: 'Failed to search directors' })
  }
})

/**
 * @swagger
 * /directors:
 *   post:
 *     summary: Create a new director
 *     tags: [Directors]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - genre
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Christopher Nolan"
 *               genre:
 *                 type: string
 *                 example: "Sci-Fi"
 *               movies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *     responses:
 *       201:
 *         description: Director created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Director'
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error while creating director
 */
router.post('/', isAdmin, async (req, res) => {
  console.log('POST /directors - Body:', JSON.stringify(req.body))
  try {
    const director = await createDirector(req.body)
    console.log('Created director:', director._id)
    res.status(201).json(director)
  } catch (error) {
    console.error('Error creating director:', error)
    res.status(500).json({ error: 'Failed to create director' })
  }
})

/**
 * @swagger
 * /directors/{id}:
 *   put:
 *     summary: Update a director
 *     tags: [Directors]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Director ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Updated Name"
 *               genre:
 *                 type: string
 *                 example: "Action"
 *               movies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *     responses:
 *       200:
 *         description: Director updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Director'
 *       404:
 *         description: Director not found
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error while updating director
 */
router.put('/:id', isAdmin, async (req, res) => {
  console.log(`PUT /directors/${req.params.id} - Body:`, JSON.stringify(req.body))
  try {
    const director = await updateDirector(req.params.id, req.body)
    if (!director) {
      console.log(`Director not found: ${req.params.id}`)
      return res.status(404).json({ error: 'Director not found' })
    }
    console.log('Updated director:', director._id)
    res.status(200).json(director)
  } catch (error) {
    console.error('Error updating director:', error)
    res.status(500).json({ error: 'Failed to update director' })
  }
})

/**
 * @swagger
 * /directors/{id}:
 *   delete:
 *     summary: Delete a director
 *     tags: [Directors]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Director ID to delete
 *     responses:
 *       200:
 *         description: Director deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Director deleted successfully"
 *       404:
 *         description: Director not found
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.delete('/:id', isAdmin, async (req, res) => {
  console.log(`DELETE /directors/${req.params.id}`)
  try {
    const director = await deleteDirector(req.params.id)
    if (!director) {
      console.log(`Director not found: ${req.params.id}`)
      return res.status(404).json({ error: 'Director not found' })
    }
    console.log('Deleted director:', req.params.id)
    res.status(200).json({ message: 'Director deleted successfully' })
  } catch (error) {
    console.error('Error deleting director:', error)
    res.status(500).json({ error: 'Failed to delete director' })
  }
})

export default router
