import { supabase, isSupabaseReady } from '../config/supabase.js';
import { localStore } from './localStore.js';
import { v4 as uuidv4 } from 'uuid';

export const sosModel = {
  async create(data) {
    const newEvent = {
      id: uuidv4(),
      user_id: data.user_id || null,
      incident_type: data.incident_type || 'Emergency',
      severity: data.severity || 'HIGH',
      people_involved: data.people_involved || 1,
      injury_reported: Boolean(data.injury_reported),
      hazard_reported: Boolean(data.hazard_reported),
      ai_summary: data.ai_summary || '',
      recommended_action: data.recommended_action || '',
      latitude: data.latitude !== undefined ? data.latitude : null,
      longitude: data.longitude !== undefined ? data.longitude : null,
      location_accuracy: data.location_accuracy !== undefined ? data.location_accuracy : null,
      status: data.status || 'ACTIVE',
      created_at: new Date().toISOString(),
      resolved_at: null
    };

    if (isSupabaseReady()) {
      const { data: record, error } = await supabase
        .from('sos_events')
        .insert([newEvent])
        .select()
        .single();
      if (!error && record) return record;
      console.warn('Supabase create SOS error, saving to local store:', error?.message);
    }

    localStore.insert('sos_events', newEvent);
    return newEvent;
  },

  async findAll() {
    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('sos_events')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
      console.warn('Supabase findAll SOS error:', error?.message);
    }

    const events = localStore.get('sos_events');
    const users = localStore.get('users');
    return events
      .map(ev => {
        const user = users.find(u => u.id === ev.user_id);
        return {
          ...ev,
          users: user ? { name: user.name, email: user.email } : null
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async findByUserId(userId) {
    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('sos_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
      console.warn('Supabase findByUserId SOS error:', error?.message);
    }

    const events = localStore.get('sos_events');
    return events
      .filter(ev => ev.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async findById(id) {
    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('sos_events')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    }

    const events = localStore.get('sos_events');
    const users = localStore.get('users');
    const ev = events.find(e => e.id === id);
    if (!ev) return null;
    const user = users.find(u => u.id === ev.user_id);
    return {
      ...ev,
      users: user ? { name: user.name, email: user.email } : null
    };
  },

  async updateStatus(id, status) {
    const now = new Date().toISOString();
    const updates = {
      status,
      resolved_at: status === 'RESOLVED' ? now : null
    };

    if (isSupabaseReady()) {
      const { data, error } = await supabase
        .from('sos_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
      console.warn('Supabase updateStatus SOS error:', error?.message);
    }

    return localStore.update('sos_events', id, updates);
  }
};
