import { Router } from 'express';
import { sosController } from '../controllers/sosController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// SOS Creation (Supports authenticated user or guest emergency)
router.post('/', optionalAuthMiddleware, sosController.create);

// Emergency Contact Dashboard / Live alerts feed
router.get('/', sosController.getAll);

// Authenticated user's own SOS history
router.get('/my-events', authMiddleware, sosController.getUserEvents);

// Get specific SOS event
router.get('/:id', sosController.getById);

// Update status (e.g. DISPATCHED, RESOLVED)
router.patch('/:id/status', sosController.updateStatus);

export default router;
