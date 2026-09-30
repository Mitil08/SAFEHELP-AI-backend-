import { contactSchema } from '../validators/contactValidator.js';
import { contactService } from '../services/contactService.js';

export const contactController = {
  async getContacts(req, res, next) {
    try {
      const contacts = await contactService.getContactsByUser(req.user.userId);
      return res.status(200).json({
        success: true,
        data: contacts
      });
    } catch (err) {
      next(err);
    }
  },

  async addContact(req, res, next) {
    try {
      const validated = contactSchema.parse(req.body);
      const contact = await contactService.addContact(req.user.userId, validated);
      return res.status(201).json({
        success: true,
        message: 'Emergency contact added successfully',
        data: contact
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteContact(req, res, next) {
    try {
      await contactService.removeContact(req.user.userId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Emergency contact deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};
