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
    <div className="h-[25vh] px-4 py-9">
      {/* ルーム名 */}
      <h2
        className="text-center text-5xl h-1/2 text-gray-600 truncate"
        style={{ fontFamily: "NicoMoji" }}
      >
        {roomData?.name}
      </h2>

      {/* パスワード表示 */}
      <div className="relative mt-6 text-center flex items-center justify-center space-x-4 border-3 border-gray-100 rounded-2xl pt-3 pb-3 min-w-[300px] h-[50px]">
        <div className="w-full flex items-center justify-between px-5">
          <div className="flex items-center">
            <p
              className="text-2xl"
              style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
            >
              パスワード：
            </p>
            <p
              className="text-2xl font-semibold ml-4"
              style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
            >
              {roomData?.pass}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-2 py-2 rounded transition-all duration-300 ${
              copied
                ? "bg-green-100 scale-110 rounded-full"
                : "hover:bg-gray-200"
            }`}
          >
            {copied ? (
              <IoCheckmarkOutline
                size={24}
                color="#22c55e"
                className="animate-pulse"
              />
            ) : (
              <IoCopyOutline size={24} color="#7d7d7d" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowRoomDetails;
