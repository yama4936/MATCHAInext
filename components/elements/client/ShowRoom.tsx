"use client";

import React, { useEffect, useState } from "react";

import { getRoomData } from "@/utils/supabaseFunction";

const ShowRoom = () => {
  const [roomData, setRoomData] = useState<any>([]);

  useEffect(() => {
    const RoomData = async () => {
      const roomData = await getRoomData();
      setRoomData(roomData);
    };
    RoomData();
  }, []);
  return (
    <div className="h-[20vh] px-4 py-25">
      {/* ルーム名 */}
      <h2
        className="text-center text-5xl h-1/2"
        style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
      >
        {roomData.name}
      </h2>
    </div>
  );
};

export default ShowRoom;
