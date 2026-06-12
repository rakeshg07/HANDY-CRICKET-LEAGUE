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

// Friends API
router.get('/friends', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const friends = await User.find({ userId: { $in: req.user.friends } })
      .select('fullName userId country avatar rank isOnline');
    res.json({ friends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.get('/friends/pending', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const requests = await User.find({ userId: { $in: req.user.friendRequests } })
      .select('fullName userId country avatar rank isOnline');
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.post('/friends/request', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;
    if (!req.user || !targetUserId) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }
    if (req.user.userId === targetUserId) {
      res.status(400).json({ message: 'Cannot add yourself' });
      return;
    }
    const targetUser = await User.findOne({ userId: targetUserId });
    if (!targetUser) {
      res.status(404).json({ message: 'Target user not found' });
      return;
    }
    if (targetUser.friendRequests.includes(req.user.userId)) {
      res.status(400).json({ message: 'Friend request already sent' });
      return;
    }
    if (req.user.friends.includes(targetUserId)) {
      res.status(400).json({ message: 'Already friends' });
      return;
    }
    targetUser.friendRequests.push(req.user.userId);
    await targetUser.save();
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.post('/friends/accept', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;
    if (!req.user || !targetUserId) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }
    if (!req.user.friendRequests.includes(targetUserId)) {
      res.status(400).json({ message: 'No friend request from this user' });
      return;
    }
    const targetUser = await User.findOne({ userId: targetUserId });
    if (!targetUser) {
      res.status(404).json({ message: 'Target user not found' });
      return;
    }

    req.user.friendRequests = req.user.friendRequests.filter(id => id !== targetUserId);
    if (!req.user.friends.includes(targetUserId)) {
      req.user.friends.push(targetUserId);
    }
    await req.user.save();

    if (!targetUser.friends.includes(req.user.userId)) {
      targetUser.friends.push(req.user.userId);
      await targetUser.save();
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.post('/friends/decline', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;
    if (!req.user || !targetUserId) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }
    req.user.friendRequests = req.user.friendRequests.filter(id => id !== targetUserId);
    await req.user.save();
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.post('/friends/remove', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;
    if (!req.user || !targetUserId) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }
    const currentUserId = req.user.userId;
    req.user.friends = req.user.friends.filter(id => id !== targetUserId);
    await req.user.save();

    const targetUser = await User.findOne({ userId: targetUserId });
    if (targetUser) {
      targetUser.friends = targetUser.friends.filter(id => id !== currentUserId);
      await targetUser.save();
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

export default router;
