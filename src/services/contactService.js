import { emergencyContactModel } from '../models/emergencyContactModel.js';

export const contactService = {
  async getContactsByUser(userId) {
    return await emergencyContactModel.findByUserId(userId);
  },

  async addContact(userId, { name, phone, email }) {
    return await emergencyContactModel.create({
      user_id: userId,
      name,
      phone,
      email
    });
  },

  async removeContact(userId, contactId) {
    const success = await emergencyContactModel.delete(contactId, userId);
    if (!success) {
      const err = new Error('Contact not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }
    return true;
  }
};
