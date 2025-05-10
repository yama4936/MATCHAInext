import { supabase } from "../utils/supabase";

export const getAllClients = async () => {
  const userid = localStorage.getItem("id");
  const mydata = await supabase
    .from("user")
    .select("room_pass")
    .eq("id", userid)
    .single();

  const pass = mydata.data?.room_pass;

  // クライアント情報を取得
  const { data: clientsData, error: clientError } = await supabase
    .from("user")
    .select("*")
    .eq("room_pass", pass)
    .eq("role", "client");

  if (clientError) {
    return [];
  }

  return clientsData;
};

export const getRoomData = async () => {
  const userid = localStorage.getItem("id");
  const mydata = await supabase
    .from("user")
    .select("room_pass")
    .eq("id", userid)
    .single();

  const pass = mydata.data?.room_pass;

  const roomData = await supabase
    .from("room")
    .select("pass, name")
    .eq("pass", pass) // room_passが一致するユーザーをフィルタリング
    .single();
  return roomData.data;
};

export const getUserById = async (id: string) => {
  console.log(id);
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", id)
    .single();  // 単一のレコードのみ取得

  // エラーが発生した場合
  if (error) {
    console.error('Error fetching user:', error.message);
    return false;
  }

  if (!data) {
    return false;
  } else {
    return true;
  }
};

export const updateUser = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from("user")
    .insert({ id: id, name: name })
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error.message);
    throw error;
  }

  return data.id;
};

export const addUser = async (name: string) => {
  const { data, error } = await supabase
    .from("user")
    .insert({ name })
    .select()
    .maybeSingle();

  if (error || !data) {
    console.error("Error adding user:", error?.message ?? "No data returned");
    return null; // or throw error;
  }

  return data.id;
};


export const addRoom = async (pass: number, name: string) => {
  const userid = localStorage.getItem("id");
  if (!userid) {
    console.error("User ID is null or undefined");
    return;
  }

  try {
    const currentTime = new Date();
    
    // ルームを追加
    const { error: roomError } = await supabase
      .from("room")
      .insert({ 
        pass: pass, 
        name: name,
        update_at: currentTime,
        is_open: true // デフォルト値を設定
      });
      
    if (roomError) {
      console.error("Error adding room:", roomError);
      return;
    }

  // ユーザーを更新
  const { error: userError } = await supabase
  .from("user")
  .update({ 
    room_pass: pass, 
    role: "host", 
    update_at: currentTime 
  })
  .eq("id", userid);
  
if (userError) {
  console.error("Error updating user:", userError);
}
} catch (e) {
console.error("Error in addRoom:", e);
}
};

export const generateRoomId = async () => {
  let roomid: number;
  let existingRoom: any;
  do {
    roomid = Math.floor(1000 + Math.random() * 9000);
    existingRoom = await supabase
      .from("room")
      .select("pass")
      .eq("pass", roomid)
      .single();
  } while (existingRoom.data); // 既に存在する場合は再生成

  return roomid;
};

export const joinRoom = async (pass: number) => {
  const userid = localStorage.getItem("id");
  await supabase
    .from("user")
    .update({ room_pass: pass, role: "client", update_at: new Date() })
    .eq("id", userid);

  await supabase
    .from("room")
    .update({ update_at: new Date() })
    .eq("pass", pass);
};

export const findPassword = async (password: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("room")
      .select("pass")
      .eq("pass", password)
      .maybeSingle();
    
    if (error) {
      console.error("Password check error:", error);
      return false;
    }
    
    return !!data; // データが存在すればtrue、なければfalse
  } catch (e) {
    console.error("Error in findPassword:", e);
    return false;
  }
};

export const isRoomLocking = async (password: number): Promise<boolean> => {
  const { data } = await supabase
    .from("room")
    .select("is_open")
    .eq("pass", password)
    .single(); // passが一致する1件のデータを取得

  await supabase
    .from("room")
    .update({ update_at: new Date() })
    .eq("pass", password);

  if (!data) {
    return false;
  } else {
    return data.is_open;
  }
};

export const CheckRole = async () => {
  const userid = localStorage.getItem("id");
  const { data } = await supabase
    .from("user")
    .select("role")
    .eq("id", userid)
    .single();
  return data?.role || null;
};

export const updateLocation = async (
  latitude: number,
  longitude: number,
  altitude: number
) => {
  const userid = localStorage.getItem("id");
  if (!userid) {
    return; // IDがない場合は更新しない
  }
  
  try {
    const { error } = await supabase
      .from("user")
      .update({
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        update_at: new Date(),
      })
      .eq("id", userid);
      
    if (error) {
      console.error("Location update error:", error);
    }
  } catch (e) {
    console.error("Error in updateLocation:", e);
  }
};

export const getMyLocation = async () => {
  const userid = localStorage.getItem("id");
  const { data } = await supabase
    .from("user")
    .select("latitude, longitude, altitude")
    .eq("id", userid)
    .single();

  return data;
};

export const getHostLocation = async () => {
  const userid = localStorage.getItem("id");

  // room_passを取得
  const { data: mydata } = await supabase
    .from("user")
    .select("room_pass")
    .eq("id", userid)
    .single();

  const pass = mydata?.room_pass;

  // room_passがnullまたはundefinedの場合、nullを返す
  if (!pass) {
    return null;
  }

  // room_passが一致するホストの位置情報を取得
  const { data } = await supabase
    .from("user")
    .select("latitude, longitude, altitude")
    .eq("room_pass", pass) // room_passが一致するユーザーをフィルタリング
    .eq("role", "host") // roleが"host"であるユーザーを対象
    .single();

  return data;
};

// 自分 & ホストの位置情報を取得する関数（まとめて取得）
export const fetchLocations = async () => {
  const myLatestLocation = await getMyLocation();
  const hostLatestLocation = await getHostLocation();

  return {
    myLatitude: myLatestLocation?.latitude || null,
    myLongitude: myLatestLocation?.longitude || null,
    myAltitude: myLatestLocation?.altitude || null,
    hostLatitude: hostLatestLocation?.latitude || null,
    hostLongitude: hostLatestLocation?.longitude || null,
    hostAltitude: hostLatestLocation?.altitude || null,
  };
};

// 5秒ごとにデータを更新する関数
export const startLocationUpdateInterval = (callback: () => void) => {
  const intervalId = setInterval(callback, 5000); // 5秒間隔で更新

  return () => clearInterval(intervalId); // 停止用の関数を返す
};

export const setDistance = async (distance: number) => {
  const userid = localStorage.getItem("id");
  if (!userid) {
    return; // IDがない場合は更新しない
  }
  
  await supabase
    .from("user")
    .update({ distance: distance, update_at: new Date() })
    .eq("id", userid);
};

export const getAllMessages = async () => {
  const userid = localStorage.getItem("id");

  // room_passを取得
  const { data: mydata } = await supabase
    .from("user")
    .select("room_pass")
    .eq("id", userid)
    .single();

  const pass = mydata?.room_pass;

  // room_passが一致するメッセージを取得
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("room_pass", pass)

  return data || [];
};

export const addMessages = async (message: string, roomPass: number) => {
  const userid = localStorage.getItem("id");
const { data: name } = await supabase
  .from("user")
  .select("name")
  .eq("id", userid)
  .single();

  await supabase
    .from("messages")
    .insert({
      user_id: userid,
      user_name: name?.name,
      room_pass: roomPass,
      message: message,
      created_at: new Date(),
    });
};

export const getUserRoomPass = async (): Promise<number | null> => {
  const userid = localStorage.getItem("id");
  const { data, error } = await supabase
    .from("user")
    .select("room_pass")
    .eq("id", userid)
    .single();

  if (error) {
    console.error("Room Passの取得エラー:", error);
    return null;
  }

  return data?.room_pass || null;
};

export const subscribeToMessages = (
  roomPass: number,
  callback: (message: any) => void
) => {
  const subscription = supabase
    .channel("realtime-messages") // 任意のチャネル名
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const newMessage = payload.new;
        if (newMessage.room_pass === roomPass) {
          callback(newMessage);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription); // クリーンアップ
  };
};

export const ResetData = async () => {
  const userid = localStorage.getItem("id");
  if (!userid) {
    return; // IDがない場合は更新しない
  }
  
  await supabase
    .from("user")
    .update({
      latitude: null,
      longitude: null,
      altitude: null,
      distance: null,
      room_pass: null,
      role: null,
      update_at: new Date(),
    })
    .eq("id", userid);
};

// ユーザー設定の更新
export const updateUserSettings = async (
  userId: string,
  name: string,
  icon: string | null = null
) => {
  await supabase
    .from("user")
    .update({
      name: name,
      icon: icon,
      update_at: new Date(),
    })
    .eq("id", userId);
};

// ユーザー設定の取得
export const getUserSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from("user")
      .select("name, icon")
      .eq("id", userId)
      .single();

    if (error){
      console.error("Error fetching user settings:", error.message);
      return null;
    } 
    return data;
};

// 画像のアップロード
export const uploadUserIcon = async (userId: string, file: File) => {
  try {
    // ファイル名を整形（空白をアンダースコアに変換し、URLエンコード）
    const fileExt = file.name.split(".").pop(); // 拡張子を取得
    const fileName = `${Date.now()}.${fileExt}`; // タイムスタンプで一意な名前を生成
    const filePath = `${userId}/${fileName}`; // ユーザーごとのフォルダに保存

    console.log(`Uploading file to: ${filePath}`);

    // ファイルをSupabase Storageの「icons」バケットにアップロード
    await supabase.storage
      .from("icons")
      .upload(filePath, file, {
        upsert: true, // 同じファイル名があれば上書き
      });

    // アップロードしたファイルの公開URLを取得
    const { data } = supabase.storage.from("icons").getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error("Failed to get public URL");
      return null;
    }

    console.log(`File uploaded successfully: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (err) {
    console.error("Unexpected error during upload:", err);
    return null;
  }
};

export const updateRoomStatus = async (roomPass: number, isOpen: boolean) => {
  try {
    const { data, error } = await supabase
      .from("room")
      .update({ is_open: isOpen, update_at: new Date() })
      .eq("pass", roomPass)
      .select()
      .single();

    if (error) {
      console.error("Error updating room status:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Supabase function error (updateRoomStatus):", error);
    return null;
  }
};
// チャットメッセージの画像をアップロード 
export const uploadChatMessageImage = async (file: File, roomPass: string | number): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${roomPass}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading chat image:", uploadError.message);
      return null; 
    }

    // アップロードしたファイルの公開URLを取得（バケット名をchat-imagesに統一）
    const { data: publicUrlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.error("Failed to get public URL for chat image");
      return null;
    }
    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error("Unexpected error during chat image upload:", err?.message || err);
    return null;
  }
};

export const deleteMessage = async (messageId: number): Promise<boolean> => {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Error deleting message:", error.message);
    return false;
  }
  return true;
};