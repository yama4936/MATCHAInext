"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import {
  findPassword,
  isRoomLocking,
  joinRoom,
} from "@/utils/supabaseFunction";

const JoinRoomForm = () => {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const borderColors = ["#9fd8ee", "#c5e2c2", "#f7c6bd", "#c5a3cb"];

  useEffect(() => {
    const urlPassword = searchParams.get('password');
    if (urlPassword && urlPassword.length === 4 && /^\d{4}$/.test(urlPassword)) {
      setPassword(urlPassword.split(''));
    }
  }, [searchParams]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const passwordNumber = Number(password.join(""));
    if (passwordNumber === null || isNaN(passwordNumber)) {
      setError("パスワードを入力してください");
      return;
    }
    setError(null);

    const existPassword = await findPassword(passwordNumber);
    if (existPassword) {
      if (await isRoomLocking(passwordNumber)) {
        await joinRoom(passwordNumber);
        router.push(`/${passwordNumber}`);
      } else {
        setError("そのルームにはカギがかかっています");
        return;
      }
    } else {
      setError("そのルームは存在していません");
      return;
    }
    setError(null);
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPassword = [...password];
    newPassword[index] = value;
    setPassword(newPassword);

    if (value !== "" && index < 3 && inputRefs.current[index + 1]) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 100); // 小さな遅延を加えて二重移動を防ぐ
    }
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="flex justify-center items-center gap-3 mb-10">
          {password.map((val, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text" // そのまま
              inputMode="numeric" // 数字キーボードを開く
              pattern="[0-9]" // 数字のみ許可
              maxLength={1}
              className="w-18 h-22 border-2 rounded-2xl text-center text-4xl outline-none"
              style={{
                borderColor: borderColors[index],
                color: "#7d7d7d",
                fontFamily: "NicoMoji",
              }}
              value={val}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  e.preventDefault();
                  const newPassword = [...password];
                  newPassword[index] = "";
                  setPassword(newPassword);
                  if (index > 0) {
                    setTimeout(() => {
                      inputRefs.current[index - 1]?.focus();
                    }, 50);
                  }
                }
              }}
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-45 h-13 mx-auto block px-2 py-2 mb-8 bg-white rounded-xl"
          style={{
            boxShadow: "2px 6px 3px #dee6ee",
            fontFamily: "NicoMoji",
          }}
        >
          <p className="text-gray-600 text-2xl">
          ルームに参加
          </p>
        </motion.button>
      </form>
    </div>
  );
};

export default JoinRoomForm;
