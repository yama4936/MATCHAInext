"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import {
  findPassword,
  isRoomLocking,
  joinRoom,
} from "@/utils/supabaseFunction";
import LockedRoomModal from "@/components/modals/locked-room-modal";

const JoinRoomForm = () => {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const router = useRouter();

  const borderColors = ["#9fd8ee", "#c5e2c2", "#f7c6bd", "#c5a3cb"];

  useEffect(() => {
    const urlPassword = searchParams.get("password");
    if (
      urlPassword &&
      urlPassword.length === 4 &&
      /^\d{4}$/.test(urlPassword)
    ) {
      setPassword(urlPassword.split(""));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const passwordString = password.join("");
    if (passwordString.length !== 4 || !/^\d{4}$/.test(passwordString)) {
      setError("4桁の数字でパスワードを入力してください");
      setIsLoading(false);
      inputRefs.current[0]?.focus();
      return;
    }
    const passwordNumber = Number(passwordString);

    try {
      const roomExists = await findPassword(passwordNumber);

      if (roomExists) {
        const canJoin = await isRoomLocking(passwordNumber);

        if (canJoin) {
          await joinRoom(passwordNumber);
          router.push(`/${passwordNumber}`);
        } else {
          setShowLockedModal(true);
          setError(null);
          setIsLoading(false);
        }
      } else {
        setError("そのルームは存在していません");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Error joining room:", err);
      setError(
        err.message || "処理中にエラーが発生しました。再度お試しください。"
      );
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPassword = [...password];
    newPassword[index] = value.slice(0, 1);
    setPassword(newPassword);

    if (value !== "" && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newPassword = [...password];
      if (newPassword[index] !== "") {
        newPassword[index] = "";
        setPassword(newPassword);
      } else if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
        newPassword[index - 1] = "";
        setPassword(newPassword);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    if (/^\d{4}$/.test(pastedData)) {
      setPassword(pastedData.split(""));
      inputRefs.current[3]?.focus();
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <div
            className="flex justify-center items-center gap-3 mb-8"
            onPaste={handlePaste}
          >
            {password.map((val, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-16 h-20 sm:w-18 sm:h-22 border-2 rounded-xl text-center text-3xl sm:text-4xl outline-none appearance-none transition-shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                style={{
                  borderColor: borderColors[index],
                  color: "#7d7d7d",
                  fontFamily: "NicoMoji",
                  boxShadow: "1px 3px 2px #e0e5ec",
                }}
                value={val}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                aria-label={`パスワード ${index + 1}桁目`}
              />
            ))}
          </div>
          {error && (
            <p
              className="text-red-500 text-center mb-6 text-sm sm:text-base px-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {error}
            </p>
          )}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-45 h-13 mx-auto block px-4 py-2 mb-8 bg-white rounded-xl"
            style={{
              boxShadow: "2px 6px 3px #dee6ee",
              fontFamily: "NicoMoji",
            }}
            disabled={isLoading}
          >
            <p className="text-gray-600 text-2xl">
              {isLoading ? "確認中..." : "ルームに参加"}
            </p>
          </motion.button>
        </form>
      </div>
      <LockedRoomModal
        isOpen={showLockedModal}
        onClose={() => {
          setShowLockedModal(false);
          setPassword(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }}
      />
    </>
  );
};

export default JoinRoomForm;
