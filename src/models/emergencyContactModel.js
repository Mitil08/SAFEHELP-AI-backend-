import { supabase, isSupabaseReady } from '../config/supabase.js';
import { localStore } from './localStore.js';
import { v4 as uuidv4 } from 'uuid';

export const emergencyContactModel = {
  async findByUserId(userId) {
    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
      console.warn('Supabase findByUserId contact error:', error?.message);
    }

    const contacts = localStore.get('emergency_contacts');
    return contacts
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async create({ user_id, name, phone, email }) {
    const newContact = {
      id: uuidv4(),
      user_id,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([newContact])
        .select()
        .single();
      if (!error && data) return data;
      console.warn('Supabase create contact error:', error?.message);
    }

    localStore.insert('emergency_contacts', newContact);
    return newContact;
  },

  async delete(id, userId) {
    if (isSupabaseReady()) {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) return true;
      console.warn('Supabase delete contact error:', error?.message);
    }

    return localStore.delete('emergency_contacts', id, { user_id: userId });
  }
};
