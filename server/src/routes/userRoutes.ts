import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { protect, AuthRequest } from '../auth/authMiddleware';

const router = express.Router();

router.get('/search', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ message: 'User ID query parameter is required' });
      return;
    }

    const user = await User.findOne({ userId }).select('-password -email -friends -friendRequests -blockedUsers');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.put('/update', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, country, avatar } = req.body;
    
    if (req.user) {
      req.user.fullName = fullName || req.user.fullName;
      req.user.country = country || req.user.country;
      req.user.avatar = avatar !== undefined ? avatar : req.user.avatar;
      
      const updatedUser = await req.user.save();
      res.json({ user: updatedUser });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

export default router;
