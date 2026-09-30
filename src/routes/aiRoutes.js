import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// Text and voice transcript emergency analysis
router.post('/analyze-text', aiController.analyzeText);

// Camera image multimodal analysis and OCR
router.post('/analyze-image', uploadImage.single('image'), aiController.analyzeImage);

export default router;
