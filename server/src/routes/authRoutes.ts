import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../auth/jwt';
import { protect, AuthRequest } from '../auth/authMiddleware';

const router = express.Router();

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, userId, email, password, country, avatar } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { userId }] });
    if (userExists) {
      if (userExists.email === email) {
        res.status(409).json({ message: 'Email already registered' });
      } else {
        res.status(409).json({ message: 'User ID already taken' });
      }
      return;
    }

    const user = await User.create({
      fullName,
      userId,
      email,
      password,
      country,
      avatar,
      isOnline: true,
      lastLogin: new Date(),
    });

    const accessToken = generateAccessToken(user.userId);
    const refreshToken = generateRefreshToken(user.userId);
    
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { userId: identifier }],
    });

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    user.isOnline = true;
    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user.userId);
    const refreshToken = generateRefreshToken(user.userId);

    setTokenCookies(res, accessToken, refreshToken);

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.post('/logout', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      req.user.isOnline = false;
      req.user.lastSeen = new Date();
      await req.user.save();
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.get('/me', protect, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

router.get('/check-userid/:userid', async (req: Request, res: Response): Promise<void> => {
  try {
    const userid = req.params.userid as string;
    if (!userid || !/^[a-zA-Z0-9_]{3,20}$/.test(userid)) {
      res.status(400).json({ available: false, message: 'Invalid format' });
      return;
    }
    
    const user = await User.findOne({ userId: userid });
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({ userId: decoded.userId });
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const newAccessToken = generateAccessToken(user.userId);
    
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;
