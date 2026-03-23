import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(hostId, hostName) {
  const code = generateRoomCode();
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      host_id: hostId,
      host_name: hostName,
      state: null,
      status: 'waiting',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function joinRoom(code, guestId, guestName) {
  const { data: room, error: fetchErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  if (fetchErr || !room) throw new Error('Salle introuvable');
  if (room.status !== 'waiting') throw new Error('La partie a déjà commencé');

  const { data, error } = await supabase
    .from('rooms')
    .update({ guest_id: guestId, guest_name: guestName, status: 'ready' })
    .eq('code', code.toUpperCase())
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGameState(code, state) {
  const { error } = await supabase
    .from('rooms')
    .update({ state })
    .eq('code', code);
  if (error) throw error;
}

export function subscribeToRoom(code, callback) {
  return supabase
    .channel(`room:${code}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `code=eq.${code}`,
    }, payload => callback(payload.new))
    .subscribe();
}