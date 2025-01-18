import rateLimit from 'express-rate-limit'
import { NextApiResponse } from 'next'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  handler: (_, response: NextApiResponse) => {
    response.status(429).json({ message: 'Too many requests, please try again later.' })
  },
})

