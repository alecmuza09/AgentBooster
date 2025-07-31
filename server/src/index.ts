import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { prospectsRouter } from './routes/prospects';
import { clientsRouter } from './routes/clients';
import { policiesRouter } from './routes/policies';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json());

// --- API Routers ---
app.use('/api/prospects', prospectsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/policies', policiesRouter);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
