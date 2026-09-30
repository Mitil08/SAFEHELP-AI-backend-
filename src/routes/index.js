import { Router } from 'express';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import sosRoutes from './sosRoutes.js';
import contactRoutes from './contactRoutes.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SAFEHELP AI Backend',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/sos', sosRoutes);
router.use('/contacts', contactRoutes);

export default router;
