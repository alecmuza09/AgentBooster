import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, 'data', 'db.json');

export const readDb = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { clients: [], prospects: [] };
  }
};

export const writeDb = (data: any) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to database:", error);
  }
}; 