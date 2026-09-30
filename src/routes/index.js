import { Router } from 'express';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import sosRoutes from './sosRoutes.js';
import contactRoutes from './contactRoutes.js';

const router = Router();

// Health Check & Root API Information
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SAFEHELP AI Backend API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      ai: '/api/ai',
      sos: '/api/sos',
      contacts: '/api/contacts'
    }
  });
});

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
