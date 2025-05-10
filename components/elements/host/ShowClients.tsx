"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { getAllClients } from "@/utils/supabaseFunction";

import { IoLocationOutline } from "react-icons/io5";

const ShowClients = () => {
  const [clientsData, setClientsData] = useState<any>([]);
  const prevClientIdsRef = useRef<number[]>([]);

  // 距離を整形する関数
  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`; // 小数第一位まで表示
    }
    return `${Math.round(distance)} m`; // 小数点なしで表示
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchClients = async () => {
      try {
        const clientData = await getAllClients();
        if (!clientData) return;

        const newClientIds = clientData.map((c: any) => c.id);
        const canNotify = typeof window !== "undefined" && 
                         "Notification" in window && 
                         Notification.permission === "granted";

        // 新規参加者の通知処理
        if (canNotify) {
          const isFirstFetch = prevClientIdsRef.current.length === 0;
          const newClients = isFirstFetch 
            ? clientData
            : clientData.filter(c => !prevClientIdsRef.current.includes(c.id));

          newClients.forEach(c => {
            new Notification(`${c.name}が参加しました！`);
          });
        }

        prevClientIdsRef.current = newClientIds;
        setClientsData(clientData);

      } catch (error) {
        console.error("🚨 Error fetching clients:", error);
      }
    };

    fetchClients();
    intervalId = setInterval(fetchClients, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      {/* 参加者一覧 */}
      <div className="mt-3 ml-4 mr-4 space-y-2 overflow-y-auto h-[55vh] border-3 border-gray-100 rounded-2xl p-4">
        {clientsData.length > 0 ? (
          clientsData
            .sort((a: { id: any }, b: { id: any }) => (a.id ?? 0) - (b.id ?? 0))
            .map(
              (client: {
                id: number | null;
                name: string | null;
                icon: string | null;
                distance: number;
              }) => {
                // IDを基に色相を生成（0-360度）
                const hue = client.id
                  ? (((client.id * 83) % 360) + ((client.id * 157) % 180)) % 360
                  : 0;
                return (
                  <div
                    key={client.id}
                    className="flex justify-between items-center px-6 py-3 rounded-4xl"
                    style={{
                      backgroundColor: "white",
                      fontFamily: "NicoMoji",
                      color: "#7d7d7d",
                      boxShadow: `8px 5px 4px hsla(${hue}, 80%, 80%, 0.2), 6px 3px 2px hsla(${hue}, 80%, 80%, 0.1)`,
                      border: `1px solid hsla(${hue}, 60%, 85%, 0.8)`,
                    }}
                  >
                    <div className="flex items-center gap-">
                      <Image
                        src={client.icon || "/icons/user_default_icon.png"}
                        alt={`${client.name}のアイコン`}
                        width={45}
                        height={45}
                        className="rounded-full"
                      />
                      <span className="text-xl">{client.name}</span>
                    </div>
                    <div className="flex items-center text-xl">
                      <IoLocationOutline
                        size={24}
                        color={`hsla(${hue}, 70%, 60%, 0.8)`}
                        className="mr-3"
                      />
                      <span className="ml-1">
                        {formatDistance(client.distance)}
                      </span>
                    </div>
                  </div>
                );
              }
            )
        ) : (
          <div className="flex justify-center items-center h-[54vh] w-full">
            <p
              className="text-center text-xl "
              style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
            >
              参加者がまだいません
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowClients;
