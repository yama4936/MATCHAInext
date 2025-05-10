"use client";

import React, { useEffect, useState } from "react";
import { getRoomData } from "@/utils/supabaseFunction";
import { IoCheckmarkOutline, IoCopyOutline, IoShareSocialOutline, IoClose } from "react-icons/io5";
import { FaLine, FaXTwitter } from "react-icons/fa6";

const ShowRoomDetails = () => {
  const [roomData, setRoomData] = useState<any>([]);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const RoomData = async () => {
      const roomData = await getRoomData();
      setRoomData(roomData);
    };
    RoomData();
  }, []);

  const copyToClipboard = async () => {
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
  };

  return (
    <div className="h-[25vh] px-4 py-9">
      {/* ルーム名 */}
      <h2
        className="text-center text-5xl h-1/2 text-gray-600 truncate"
        style={{
          fontFamily: "NicoMoji",
        }}
      >
        {roomData.name}
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
              {roomData.pass}
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
                handleShare(roomData.pass, "line");
                setIsModalOpen(false);
              }}
              className="flex items-center space-x-2 p-2 border-1 border-green-500 rounded hover:bg-green-100"
            >
              <FaLine size={16} color="#06C755" />
              <span className="text-sm">LINEで共有</span>
            </button>
            <button
              onClick={() => {
                handleShare(roomData.pass, "x");
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
