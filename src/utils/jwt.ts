import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

export function signToken(payload: object) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
} 