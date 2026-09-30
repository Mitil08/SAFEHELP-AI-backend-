import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // Zod Validation Error Handling
  if (err instanceof ZodError) {
    const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  // Multer Error Handling
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Image upload error: ${err.message}`
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';

  return res.status(statusCode).json({
    success: false,
    message
  });
};
