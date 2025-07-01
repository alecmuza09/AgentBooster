import { Router } from 'express';
import { z } from 'zod';
import { readDB, writeDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const paymentFormValues: [string, ...string[]] = ['monthly', 'quarterly', 'annual', 'single'];
const paymentMethodValues: [string, ...string[]] = ['direct_debit', 'card', 'transfer', 'cash'];

const policySchema = z.object({
  clientId: z.string().min(1),
  policyNumber: z.string().min(3).max(50),
  policyType: z.string().min(1),
  insuranceCompany: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  premiumAmount: z.number().positive(),
  paymentForm: z.enum(paymentFormValues),
  paymentMethod: z.enum(paymentMethodValues),
  // Campos opcionales que pueden o no venir del form
  status: z.string().optional().default('Activa'),
  insuredDetails: z.object({
    fullName: z.string(),
    birthDate: z.string(),
  }).optional(),
});

// GET /api/policies - Obtener todas las pólizas
router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.policies || []);
  } catch (error) {
    res.status(500).json({ message: 'Error al leer la base de datos', error });
  }
});

// POST /api/policies - Crear una nueva póliza
router.post('/', async (req, res) => {
  try {
    const validation = policySchema.safeParse(req.body);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      const errorMessages = Object.entries(formattedErrors)
        .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
        .join('; ');
      return res.status(400).json({ message: `Datos de póliza inválidos. ${errorMessages}` });
    }

    const db = await readDB();
    const newPolicy = {
      id: uuidv4(),
      ...validation.data,
      createdAt: new Date().toISOString(),
    };
    
    db.policies = db.policies || [];
    db.policies.push(newPolicy);
    
    await writeDB(db);
    
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la póliza', error });
  }
});

export { router as policiesRouter }; 