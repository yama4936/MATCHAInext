"use client";

import { useEffect } from "react";

import { addUser } from "@/utils/supabaseFunction";

const ConfirmLocalStorage = () => {

  useEffect(() => {
    const setStorage = async () => {
      const existId = await localStorage.getItem("id");
        if (existId) {
          await localStorage.setItem("id",existId);
        }else{
            // IDがない場合、新規ユーザーを作成
          const userId = await addUser("Guest");
          await localStorage.setItem("id",userId);
        }
  };
    setStorage();
  }, []);
  return null;
};

export default ConfirmLocalStorage;
 