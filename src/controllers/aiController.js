import { analyzeTextSchema } from '../validators/aiValidator.js';
import { aiService } from '../services/aiService.js';

export const aiController = {
  async analyzeText(req, res, next) {
    try {
      const { text } = analyzeTextSchema.parse(req.body);
      const analysis = await aiService.analyzeEmergencyText(text);
      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (err) {
      next(err);
    }
  },

  async analyzeImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'An image file is required for visual analysis'
        });
      }

      const userPrompt = req.body.prompt || '';
      const analysis = await aiService.analyzeEmergencyImage(
        req.file.buffer,
        req.file.mimetype,
        userPrompt
      );

      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (err) {
      next(err);
    }
  }
};
