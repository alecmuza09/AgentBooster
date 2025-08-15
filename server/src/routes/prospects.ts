import { Router, Request, Response } from 'express';
import { readDB, writeDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface Prospect {
    id: string;
    name: string;
    stage: string;
    [key: string]: any;
}

// GET /api/prospects
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await readDB();
        res.json(db.prospects || []);
    } catch (error) {
        res.status(500).json({ message: 'Error al leer la base de datos de prospectos' });
    }
});

// POST /api/prospects
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await readDB();
        const newProspectData = req.body;
        const newProspect = { ...newProspectData, id: uuidv4(), stage: 'no_contacted' };
        
        db.prospects = db.prospects || [];
        db.prospects.push(newProspect);
        
        await writeDB(db);
        res.status(201).json(newProspect);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el prospecto' });
    }
});

// PUT /api/prospects/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await readDB();
        const { id } = req.params;
        const { stage, ...updatedData } = req.body;
        
        const prospectIndex = db.prospects.findIndex((p: any) => p.id === id);
        if (prospectIndex === -1) {
            res.status(404).json({ message: 'Prospecto no encontrado' });
            return;
        }

        if (stage === 'client') {
            const prospectToConvert = db.prospects[prospectIndex];
            const newClient = {
                id: uuidv4(),
                internal_id: `CLI${Date.now().toString().slice(-6)}`,
                name: prospectToConvert.name,
                email: prospectToConvert.email || '',
                phone: prospectToConvert.phone || '',
                status: 'active',
                policyCount: 0,
                assignedAdvisor: 'Por asignar',
            };
            
            db.clients = db.clients || [];
            db.clients.push(newClient);
            db.prospects.splice(prospectIndex, 1);
            
            await writeDB(db);
            res.status(200).json({ message: 'Prospecto convertido a cliente', newClient });
            return;
        }

        const updatedProspect = { ...db.prospects[prospectIndex], ...updatedData, stage };
        db.prospects[prospectIndex] = updatedProspect;
        
        await writeDB(db);
        res.status(200).json(updatedProspect);

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el prospecto' });
    }
});

export { router as prospectsRouter }; 