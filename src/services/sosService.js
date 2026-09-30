import { sosModel } from '../models/sosModel.js';

export const sosService = {
  async createSosEvent(userId, data) {
    const eventData = {
      ...data,
      user_id: userId || null
    };
    return await sosModel.create(eventData);
  },

  async getAllEvents() {
    return await sosModel.findAll();
  },

  async getEventsByUser(userId) {
    return await sosModel.findByUserId(userId);
  },

  async getEventById(id) {
    const event = await sosModel.findById(id);
    if (!event) {
      const err = new Error('SOS event not found');
      err.statusCode = 404;
      throw err;
    }
    return event;
  },

  async updateEventStatus(id, status) {
    const updated = await sosModel.updateStatus(id, status);
    if (!updated) {
      const err = new Error('SOS event not found or update failed');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }
};
