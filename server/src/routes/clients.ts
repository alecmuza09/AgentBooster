import { Router } from 'express';
import { readDB, writeDB } from '../db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Esquema de validación para un nuevo cliente
const clientSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido"),
  email: z.string().email("El email no es válido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de nacimiento debe estar en formato YYYY-MM-DD"),
  address: z.string().optional(),
  responsibleAdvisor: z.string().optional(),
});

// GET /api/clients - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.clients || []);
  } catch (error) {
    res.status(500).json({ message: 'Error al leer la base de datos de clientes', error });
  }
});

// POST /api/clients - Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    const validation = clientSchema.safeParse(req.body);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      const errorMessages = Object.entries(formattedErrors)
        .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
        .join('; ');
      return res.status(400).json({ message: `Datos de cliente inválidos. ${errorMessages}` });
    }

    const db = await readDB();
    const newClientData = validation.data;
    
    const newClient = {
      id: uuidv4(),
      name: newClientData.fullName,
      email: newClientData.email,
      phone: newClientData.phone,
      birthDate: newClientData.birthDate,
      address: newClientData.address || '',
      status: 'active',
      policyCount: 0,
      internal_id: `CLI${Date.now().toString().slice(-6)}`,
      assignedAdvisor: newClientData.responsibleAdvisor || 'No asignado',
      alerts: { pendingPayments: false, expiredDocs: false, homonym: false },
      createdAt: new Date().toISOString(),
    };

    db.clients.push(newClient);
    await writeDB(db);
    
    res.status(201).json(newClient);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear el cliente', error });
  }
});

export { router as clientsRouter }; 