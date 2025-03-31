import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetTables() {
  // 現在時刻を取得
  const currentDate = new Date();

  // roomテーブルのupdate_atが6時間前のレコードを削除
  const sixHoursAgo = new Date(currentDate.getTime() - 6 * 60 * 60 * 1000);
  const { data: rooms, error: roomsError } = await supabase
    .from('room')
    .select('pass')
    .lt('update_at', sixHoursAgo.toISOString()); // 6 時間前より古いレコードを取得

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError);
    return;
  }

  if (rooms?.length > 0) {
    const roomPass = rooms.map((room) => room.pass);

    // 対応するmessagesを削除
    const { error: deleteMessagesError } = await supabase
      .from('messages')
      .delete()
      .in('room_pass', roomPass);  // messagesテーブルのroom_passがroom.passと一致するレコードを削除

    if (deleteMessagesError) {
      console.error('Error deleting messages:', deleteMessagesError);
      return;
    } else {
      console.log(`Successfully deleted messages for ${roomPass.length} rooms.`);
    }

    // roomテーブルのレコードを削除
    const { error: deleteRoomsError } = await supabase
      .from('room')
      .delete()
      .in('pass', roomPass);

    if (deleteRoomsError) {
      console.error('Error deleting rooms:', deleteRoomsError);
    } else {
      console.log(`Successfully deleted ${roomPass.length} rooms.`);
    }
  }

  // userテーブルのupdate_atが30日前のレコードを削除
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const { data: users, error: usersError } = await supabase
    .from('user')
    .select('id')
    .lt('update_at', thirtyDaysAgo.toISOString()); // 30 日前より古いレコードを取得

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  if (users?.length > 0) {
    const userIds = users.map((user) => user.id);
    const { error: deleteUsersError } = await supabase
      .from('user')
      .delete()
      .in('id', userIds);

    if (deleteUsersError) {
      console.error('Error deleting users:', deleteUsersError);
    } else {
      console.log(`Successfully deleted ${userIds.length} users.`);
    }
  }
}

// スクリプト実行
resetTables().catch((err) => {
  console.error('Unexpected error:', err);
});
