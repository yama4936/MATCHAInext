"use client";

import { useEffect } from "react";
import { addUser, getUserById, updateUser } from "@/utils/supabaseFunction"; // getUserById関数を追加でインポート

const ConfirmLocalStorage = () => {

  useEffect(() => {
    const setStorage = async () => {
      const existId = await localStorage.getItem("id");

      if (existId) {
        // idがlocalStorageにある場合、userテーブルにそのidが存在するか確認
        const existingUser = await getUserById(existId);
        console.log(existingUser);

        if (!existingUser) {
          // idに対応するユーザーがいない場合、新規ユーザーを作成
          console.log("New user created");
          await updateUser(existId, "Guest");
        }
      } else {
        // idがない場合、新規ユーザーを作成
        const userId = await addUser("Guest");
        await localStorage.setItem("id", userId);
      }
    };

    setStorage();
  }, []);

  return null;
};

export default ConfirmLocalStorage;
