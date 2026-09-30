import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.userId);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
};
