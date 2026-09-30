import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow local frontend and network access for mobile emergency testing
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'SAFEHELP AI API',
    tagline: 'Need help? Tell us what happened.',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(ENV.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚨 SAFEHELP AI Server listening on port ${ENV.PORT}`);
  console.log(`🔗 Health Check: http://localhost:${ENV.PORT}/api/health`);
  console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
  console.log(`=======================================================`);
});

export default app;
