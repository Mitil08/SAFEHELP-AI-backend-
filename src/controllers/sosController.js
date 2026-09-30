import { createSosSchema, updateSosStatusSchema } from '../validators/sosValidator.js';
import { sosService } from '../services/sosService.js';

export const sosController = {
  async create(req, res, next) {
    try {
      const validatedData = createSosSchema.parse(req.body);
      const userId = req.user ? req.user.userId : null;
      const sosEvent = await sosService.createSosEvent(userId, validatedData);
      return res.status(201).json({
        success: true,
        message: 'SOS alert created successfully',
        data: sosEvent
      });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const events = await sosService.getAllEvents();
      return res.status(200).json({
        success: true,
        data: events
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserEvents(req, res, next) {
    try {
      const events = await sosService.getEventsByUser(req.user.userId);
      return res.status(200).json({
        success: true,
        data: events
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const event = await sosService.getEventById(req.params.id);
      return res.status(200).json({
        success: true,
        data: event
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status } = updateSosStatusSchema.parse(req.body);
      const updated = await sosService.updateEventStatus(req.params.id, status);
      return res.status(200).json({
        success: true,
        message: `SOS status updated to ${status}`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
};
