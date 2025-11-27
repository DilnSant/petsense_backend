import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/auth.routes.js';
import providerRoutes from './routes/provider.routes.js';
import serviceRoutes from './routes/service.routes.js';
import socialRoutes from './routes/social.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import importRoutes from './routes/import.routes.js';

app.use('/auth', authRoutes);
app.use('/providers', providerRoutes);
app.use('/services', serviceRoutes);
app.use('/', socialRoutes);
app.use('/files', uploadRoutes);
app.use('/imports', importRoutes);

// Error Handler
app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
