import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, 'data', 'db.json');

interface Database {
  clients: any[];
  prospects: any[];
  policies: any[];
  [key: string]: any;
}

export const readDB = async (): Promise<Database> => {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data) as Database;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Si el archivo no existe, lo creamos con una estructura base
      const initialDb: Database = { clients: [], prospects: [], policies: [] };
      await writeDB(initialDb);
      return initialDb;
    }
    console.error("Error reading database:", error);
    // Devolvemos una estructura vacía en caso de otro tipo de error
    return { clients: [], prospects: [], policies: [] };
  }
};

export const writeDB = async (data: Database): Promise<void> => {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to database:", error);
    throw error; // Lanzamos el error para que el llamador pueda manejarlo
  }
}; 