import { Router } from 'express';
import { readDb, writeDb } from '../db';

export const prospectsRouter = Router();

interface Prospect {
    id: string;
    name: string;
    stage: string;
    [key: string]: any;
}

// GET /api/prospects
prospectsRouter.get('/', (req, res) => {
    const db = readDb();
    res.json(db.prospects || []);
});

// POST /api/prospects
prospectsRouter.post('/', (req, res) => {
    const db = readDb();
    const newProspectData = req.body;
    const newProspect = { ...newProspectData, id: `p${Date.now()}`, stage: 'no_contacted' };
    db.prospects.push(newProspect);
    writeDb(db);
    console.log('Prospecto añadido:', newProspect);
    res.status(201).json(newProspect);
});

// PUT /api/prospects/:id
// @ts-ignore
prospectsRouter.put('/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const { stage, ...updatedData } = req.body;
    const prospectIndex = db.prospects.findIndex((p: Prospect) => p.id === id);

    if (prospectIndex === -1) {
        return res.status(404).json({ message: 'Prospecto no encontrado' });
    }

    if (stage === 'client') {
        const prospectToConvert = db.prospects[prospectIndex];
        const newClient = {
            id: `c${Date.now()}`,
            internal_id: `CLI${Date.now().toString().slice(-6)}`,
            name: prospectToConvert.name,
            rfc: '',
            email: prospectToConvert.email || '',
            phone: prospectToConvert.phone || '',
            status: 'active',
            policyCount: 0,
            assignedAdvisor: 'Por asignar',
            insuranceCompany: prospectToConvert.company || '-',
            alerts: { pendingPayments: false, expiredDocs: false, homonym: false },
        };
        db.clients.push(newClient);
        db.prospects.splice(prospectIndex, 1);
        writeDb(db);
        console.log('Prospecto convertido a cliente:', newClient);
        return res.status(200).json({ message: 'Prospecto convertido', newClient });
    }

    const updatedProspect = { ...db.prospects[prospectIndex], ...updatedData, stage };
    db.prospects[prospectIndex] = updatedProspect;
    writeDb(db);
    console.log('Prospecto actualizado:', updatedProspect);
    res.status(200).json(updatedProspect);
}); 