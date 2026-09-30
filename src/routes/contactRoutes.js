import { Router } from 'express';
import { contactController } from '../controllers/contactController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Emergency contacts require authentication
router.use(authMiddleware);

router.get('/', contactController.getContacts);
router.post('/', contactController.addContact);
router.delete('/:id', contactController.deleteContact);

export default router;
