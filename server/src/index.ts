import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readDb, writeDb } from './db';
import { prospectsRouter } from './routes/prospects';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json());

// --- API Routers ---
app.use('/api/prospects', prospectsRouter);

// --- API Endpoints for Clients (se mantienen aquí por ahora) ---

app.get('/api/clients', (req, res) => {
  const db = readDb();
  res.json(db.clients || []);
});

app.post('/api/clients', (req, res) => {
  const db = readDb();
  const newClientData = req.body;
  
  const newClient = {
    ...newClientData,
    id: `c${Date.now()}`,
    name: newClientData.fullName,
    status: 'active',
    policyCount: 0,
    internal_id: `CLI${Date.now().toString().slice(-6)}`,
    assignedAdvisor: newClientData.responsibleAdvisor || 'No asignado',
    alerts: { pendingPayments: false, expiredDocs: false, homonym: false },
  };

  db.clients.push(newClient);
  writeDb(db);
  
  console.log('Cliente añadido:', newClient);
  res.status(201).json(newClient);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
