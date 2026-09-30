import multer from 'multer';

// Memory storage keeps the image in memory as a buffer, ideal for direct Gemini API multimodal processing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, etc.) are allowed for emergency analysis'), false);
  }
};

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter
});
