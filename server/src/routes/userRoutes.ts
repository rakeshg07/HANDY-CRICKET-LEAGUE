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
    const { fullName, country, avatar, userId, oldPassword, newPassword } = req.body;
    
    if (!req.user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Handle Username (userId) change
    if (userId && userId !== req.user.userId) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(userId)) {
        res.status(400).json({ message: 'Invalid username format' });
        return;
      }
      const existingUser = await User.findOne({ userId });
      if (existingUser) {
        res.status(409).json({ message: 'Username is already taken' });
        return;
      }
      req.user.userId = userId;
    }

    // Handle Password change
    if (oldPassword && newPassword) {
      const isMatch = await req.user.comparePassword(oldPassword);
      if (!isMatch) {
        res.status(401).json({ message: 'Incorrect old password' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters long' });
        return;
      }
      req.user.password = newPassword;
    }

    req.user.fullName = fullName || req.user.fullName;
    req.user.country = country || req.user.country;
    req.user.avatar = avatar !== undefined ? avatar : req.user.avatar;
    
    const updatedUser = await req.user.save();
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

export default router;
