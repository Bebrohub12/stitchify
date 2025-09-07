import jwt from 'jsonwebtoken'

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    return decoded as { userId: string }
  } catch (error) {
    return null
  }
}

export function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  )
}
