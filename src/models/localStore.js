import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../local_db.json');

// In-memory cache synced to local_db.json
let store = {
  users: [],
  emergency_contacts: [],
  sos_events: []
};

try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    store = JSON.parse(data);
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  }
} catch (e) {
  console.warn('Local database initialization note:', e.message);
}

const persist = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write local database:', e.message);
  }
};

export const localStore = {
  get(table) {
    return store[table] || [];
  },
  insert(table, record) {
    if (!store[table]) store[table] = [];
    store[table].push(record);
    persist();
    return record;
  },
  update(table, id, updates) {
    if (!store[table]) return null;
    const index = store[table].findIndex(item => item.id === id);
    if (index !== -1) {
      store[table][index] = { ...store[table][index], ...updates };
      persist();
      return store[table][index];
    }
    return null;
  },
  delete(table, id, extraFilter = {}) {
    if (!store[table]) return false;
    const beforeCount = store[table].length;
    store[table] = store[table].filter(item => {
      if (item.id !== id) return true;
      for (const [key, val] of Object.entries(extraFilter)) {
        if (item[key] !== val) return true;
      }
      return false;
    });
    if (store[table].length !== beforeCount) {
      persist();
      return true;
    }
    return false;
  }
};
