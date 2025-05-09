"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

import { getRoomData, updateRoomStatus } from "@/utils/supabaseFunction";

import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5";
import { FaLock, FaLockOpen } from "react-icons/fa";

interface RoomData {
  name: string;
  pass: number;
  is_open: boolean;
  // 他の必要なプロパティがあれば、実際のroomテーブルの構造に合わせて追加してください
  // 例: created_at: string; update_at: string;
}

const ShowRoomDetails = () => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRoomData(); // getRoomDataがRoomData型またはその配列を返すと想定
      if (data && !Array.isArray(data)) {
        // dataが単一オブジェクトであることを確認
        setRoomData(data as RoomData);
      } else if (data && Array.isArray(data) && data.length > 0) {
        setRoomData(data[0] as RoomData);
        console.warn("getRoomData returned an array, using the first element.");
      } else {
        setError(
          "ルームデータの取得に失敗しました。データ形式が正しくない可能性があります。"
        );
        setRoomData(null);
      }
    } catch (err) {
      console.error("Failed to fetch room data:", err);
      setError("ルームデータの取得中にエラーが発生しました。");
      setRoomData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  const copyToClipboard = async () => {
    if (!roomData) return;
    const roomUrl = `${window.location.origin}/?password=${roomData.pass}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました:", err);
      alert("コピーに失敗しました。ブラウザの権限設定などを確認してください。");
    }
  };

  const toggleRoomLock = async () => {
    if (!roomData) return;
    const newStatus = !roomData.is_open;
    try {
      setRoomData((prevData) =>
        prevData ? { ...prevData, is_open: newStatus } : null
      );

      const updatedRoom = await updateRoomStatus(roomData.pass, newStatus);
      if (updatedRoom) {
        setRoomData(updatedRoom as RoomData);
      } else {
        setError("ルームの状態更新に失敗しました。再度お試しください。");
        setRoomData((prevData) =>
          prevData ? { ...prevData, is_open: !newStatus } : null
        );
      }
    } catch (err) {
      console.error("Failed to toggle room lock:", err);
      setError(
        "ルームの状態更新中にエラーが発生しました。ネットワーク接続を確認してください。"
      );
      setRoomData((prevData) =>
        prevData ? { ...prevData, is_open: !newStatus } : null
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-[25vh] px-4 py-9 flex flex-col justify-center items-center text-gray-500">
        <p style={{ fontFamily: "NicoMoji" }}>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[25vh] px-4 py-9 flex flex-col justify-center items-center text-center">
        <p
          className="text-red-500 text-lg mb-4"
          style={{ fontFamily: "NicoMoji" }}
        >
          {error}
        </p>
        <button
          onClick={fetchRoomData}
          className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          style={{ fontFamily: "NicoMoji" }}
        >
          再試行
        </button>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="h-[25vh] px-4 py-9 flex flex-col justify-center items-center text-center">
        <p className="text-gray-600 text-lg" style={{ fontFamily: "NicoMoji" }}>
          ルームデータが見つかりません。
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[25vh] px-3 py-6 sm:px-4 sm:py-9 flex flex-col justify-between">
      {/* ルーム名と鍵アイコンセクション */}
      <div className="text-center mb-2">
        {/* ルーム名と鍵アイコンのコンテナ */}
        <div className="flex items-center justify-center h-auto min-h-[3rem] sm:min-h-[3.5rem]">
          <h2
            className="text-4xl sm:text-5xl text-gray-600 truncate flex-shrink min-w-0 pr-1 sm:pr-2"
            style={{
              fontFamily: "NicoMoji",
            }}
            title={roomData.name}
          >
            {roomData.name}
          </h2>
          <motion.button
            onClick={toggleRoomLock}
            whileTap={{ scale: 0.9, y: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="p-1 sm:p-2 ml-2 sm:ml-3 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex-shrink-0"
            aria-label={
              roomData.is_open
                ? "ルームをロックする"
                : "ルームのロックを解除する"
            }
            title={
              roomData.is_open
                ? "ルームをロックする"
                : "ルームのロックを解除する"
            }
          >
            {roomData.is_open ? (
              <FaLockOpen size={30} className="text-green-500 sm:text-[36px]" />
            ) : (
              <FaLock size={30} className="text-red-500 sm:text-[36px]" />
            )}
          </motion.button>
        </div>
        {/* 状態表示テキスト */}
        <p
          className="mt-1 text-sm sm:text-lg text-gray-500 h-auto min-h-[1.25rem]"
          style={{ fontFamily: "NicoMoji" }}
        >
          {roomData.is_open ? "ルーム公開中" : "ルームロック中"}
        </p>
      </div>

      {/* パスワード表示 */}
      <div className="relative text-center flex items-center justify-center space-x-2 sm:space-x-4 border-2 border-gray-200 bg-gray-50 rounded-2xl py-2 sm:py-3 px-3 sm:px-5 min-w-[280px] sm:min-w-[300px] shadow-sm mt-1">
        <div className="flex items-center flex-grow min-w-0">
          <p
            className="text-xl sm:text-2xl whitespace-nowrap"
            style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
          >
            パスワード：
          </p>
          <p
            className="text-xl sm:text-2xl font-semibold ml-2 sm:ml-3 tracking-wider truncate"
            style={{ fontFamily: "NicoMoji", color: "#5a5a5a" }}
            title={String(roomData.pass)}
          >
            {roomData.pass}
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex-shrink-0 ${
            copied
              ? "bg-green-100 scale-110 transform"
              : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
          }`}
          aria-label="ルームURLをコピー"
          title="ルームURLをクリップボードにコピー"
        >
          {copied ? (
            <IoCheckmarkOutline
              size={20}
              className="text-green-500 sm:text-[22px] animate-pingOnce"
            />
          ) : (
            <IoCopyOutline size={20} className="text-gray-700 sm:text-[22px]" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ShowRoomDetails;
