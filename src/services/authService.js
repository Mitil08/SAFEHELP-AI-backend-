import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';
import { ENV } from '../config/env.js';

export const authService = {
  async register({ name, email, password }) {
    // 1. Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      const err = new Error('An account with this email already exists');
      err.statusCode = 409;
      throw err;
    }

    // 2. Hash password with bcrypt (10 rounds)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 3. Create user in database
    const user = await userModel.create({
      name,
      email,
      password_hash
    });

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    };
  },

  async login({ email, password }) {
    // 1. Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // 2. Verify password with bcrypt.compare
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    };
  },

  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }
};
