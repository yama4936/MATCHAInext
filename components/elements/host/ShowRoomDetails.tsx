"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getRoomData, updateRoomStatus } from "@/utils/supabaseFunction";
import { IoCheckmarkOutline, IoCopyOutline, IoShareSocialOutline, IoClose } from "react-icons/io5";
import { FaLine, FaXTwitter, FaLock, FaLockOpen } from "react-icons/fa6";

interface RoomData {
  name: string;
  pass: number;
  is_open: boolean;
}

const ShowRoomDetails = () => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRoomData();
      if (data && !Array.isArray(data)) {
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
    if (!roomData) {
      return;
    }
    const roomUrl = `${window.location.origin}/?password=${roomData.pass}`;

    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setShowToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowToast(false);
    }, 1200);
  };

  const handleShare = async (pass: string, platform: "line" | "x") => {
    const roomUrl = `${window.location.origin}/?password=${pass}`;

    if (platform === "line") {
      const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(roomUrl)}`;
      window.open(shareUrl, "_blank");
    } else if (platform === "x") {
      const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`ルームに参加してください！URLはこちら: ${roomUrl}`)}`;
      window.open(xShareUrl, "_blank");
    }

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
    if (!roomData) {
      return;
    }
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
          onClick={() => setIsModalOpen(true)}
          className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex-shrink-0 ${
            copied
              ? "bg-green-100 scale-110 transform"
              : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
          }`}
          aria-label="共有オプションを開く"
          title="共有オプションを開く"
        >
          <IoShareSocialOutline size={20} className="text-gray-700 sm:text-[22px]" />
        </button>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="absolute top-50 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">共有オプション</h3>
            <button onClick={() => setIsModalOpen(false)}>
              <IoClose size={16} />
            </button>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                handleShare(roomData?.pass.toString(), "line");
                setIsModalOpen(false);
              }}
              className="flex items-center space-x-2 p-2 border-1 border-green-500 rounded hover:bg-green-100"
            >
              <FaLine size={16} color="#06C755" />
              <span className="text-sm">LINEで共有</span>
            </button>
            <button
              onClick={() => {
                handleShare(roomData?.pass.toString(), "x");
                setIsModalOpen(false);
              }}
              className="flex items-center space-x-2 p-2 border-1 border-black rounded hover:bg-gray-100"
            >
              <FaXTwitter size={16} color="#000000" />
              <span className="text-sm">Xで共有</span>
            </button>
            <button
              onClick={() => {
                copyToClipboard();
                setIsModalOpen(false);
              }}
              className="flex items-center space-x-2 p-2 border-1 border-gray-500 rounded hover:bg-gray-200"
            >
              <IoCopyOutline size={16} color="#7d7d7d" />
              <span className="text-sm">コピー</span>
            </button>
          </div>
        </div>
      )}

      {/* トースト通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg">
          コピーしました！
        </div>
      )}
    </div>
  );
};

export default ShowRoomDetails;
