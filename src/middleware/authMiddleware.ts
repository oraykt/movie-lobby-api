import { Request, Response, NextFunction } from 'express'

/**
 * Middleware to check if the user has admin role
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.headers['x-user-role']

  if (role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Admin access required' })
  }
}
