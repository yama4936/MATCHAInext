"use client";

import React, { useEffect, useState } from "react";

import { getRoomData } from "@/utils/supabaseFunction";

import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5";

const ShowRoomDetails = () => {
  const [roomData, setRoomData] = useState<any>([]);
  const [copied, setCopied] = useState(false);

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
    setTimeout(() => setCopied(false), 1200);
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
          onClick={copyToClipboard}
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
