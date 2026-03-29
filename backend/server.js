import express from 'express';
import cors from 'cors';
import { migrate } from './db/client.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import settingsRouter    from './routes/settings.js';
import projectsRouter   from './routes/projects.js';
import featuresRouter   from './routes/features.js';
import archRouter       from './routes/architecture.js';
import devRouter        from './routes/development.js';
import reviewRouter     from './routes/review.js';
import testingRouter    from './routes/testing.js';
import commentsRouter   from './routes/comments.js';
import openclawRouter   from './routes/openclaw.js';

// Bootstrap DB
migrate();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Routes
app.use('/api/settings',     settingsRouter);
app.use('/api/projects',     projectsRouter);
app.use('/api/features',     featuresRouter);
app.use('/api/arch',         archRouter);
app.use('/api/dev',          devRouter);
app.use('/api/review',       reviewRouter);
app.use('/api/test',         testingRouter);
app.use('/api/comments',     commentsRouter);
app.use('/api/openclaw',     openclawRouter);

app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`IntelliFlow backend running on http://localhost:${PORT}`);
});
