import { supabase, isSupabaseReady } from '../config/supabase.js';
import { localStore } from './localStore.js';
import { v4 as uuidv4 } from 'uuid';

export const userModel = {
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase findByEmail error:', error);
      }
      if (data) return data;
    }
    // Fallback to localStore
    const users = localStore.get('users');
    return users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  },

  async findById(id) {
    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase findById error:', error);
      }
      if (data) return data;
    }
    // Fallback to localStore
    const users = localStore.get('users');
    const user = users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async create({ name, email, password_hash }) {
    const now = new Date().toISOString();
    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      if (!error && data) return data;
      console.warn('Supabase create user error, saving to local persistence:', error?.message);
    }

    localStore.insert('users', newUser);
    return newUser;
  },

  async update(id, updates) {
    const now = new Date().toISOString();
    const payload = { ...updates, updated_at: now };

    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    }

    return localStore.update('users', id, payload);
  }
};
