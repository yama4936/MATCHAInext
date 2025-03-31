import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteOldRooms() {
  const sixHoursAgo = new Date();
  sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

  const { data, error } = await supabase
    .from('room')
    .delete()
    .lt('update_at', sixHoursAgo.toISOString()) as { data: any[] | null; error: any };

  if (error) {
    console.error('Error deleting rooms:', error);
    return;
  }

  console.log(`Deleted ${data?.length || 0} rooms`);
}

deleteOldRooms();
