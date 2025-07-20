import { Request, Response } from 'express';
import User from '../models/User';

export const getAll = async (_: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Fetch users failed', error: err });
  }
}; 