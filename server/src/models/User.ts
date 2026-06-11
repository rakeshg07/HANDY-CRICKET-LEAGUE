import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  fullName: string;
  userId: string;
  email: string;
  password?: string;
  country: string;
  avatar?: string;
  
  // Game Stats
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalRuns: number;
  highestScore: number;
  rank: number;
  
  // Social
  friends: string[];
  friendRequests: string[];
  blockedUsers: string[];
  
  // Status
  isOnline: boolean;
  lastSeen: Date;
  lastLogin: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    avatar: { type: String, default: '' },
    
    // Stats
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalRuns: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    rank: { type: Number, default: 1000 }, // ELO or simple rank
    
    // Social (Stubs for future features)
    friends: { type: [String], default: [] },
    friendRequests: { type: [String], default: [] },
    blockedUsers: { type: [String], default: [] },
    
    // Status
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password when converting to JSON
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
