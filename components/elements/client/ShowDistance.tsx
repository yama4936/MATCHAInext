"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import useCalclation from "@/customhooks/useCalclation";
import useGyroCompass from "@/customhooks/useGyroCompass";

const ShowDistance = () => {
  const { distance = 0, angle = 0, height = 0 } = useCalclation();
  const { permissionGranted, requestPermission, rotation } = useGyroCompass();
  const [arrowRotation, setArrowRotation] = useState<number>(0);
  const [notifiedSteps, setNotifiedSteps] = useState<number[]>([]);

  // 通知する距離のしきい値
  const notifySteps = [500, 300, 100, 50, 20];

  // 目的地の向きを計算
  useEffect(() => {
    if (angle !== null && rotation !== null) {
      setArrowRotation((angle - rotation + 360) % 360);
    }
  }, [angle, rotation]);

  // 初期マウント時に、現在の距離以下のしきい値をnotifiedStepsにセット
  useEffect(() => {
    const alreadyPassed = notifySteps.filter((step) => distance <= step);
    setNotifiedSteps(alreadyPassed);
  }, []);

  // 距離ごとに通知
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    for (const step of notifySteps) {
      if (distance <= step && !notifiedSteps.includes(step)) {
        new Notification(`ホストまで${step}m以内です！`);
        setNotifiedSteps((prev) => [...prev, step]);
        break;
      }
    }
  }, [distance, notifiedSteps]);

  // 距離を整形する関数
  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`; // 小数第一位まで表示
    }
    return `${Math.round(distance)} m`; // 小数点なしで表示
  };

  // 高度を整形する関数
  const formatHeight = (height: number) => {
    if (height >= 1000) {
      return `${(height / 1000).toFixed(1)} km`; // 小数第一位まで表示
    }
    return `${Math.round(height)} m`; // 小数点なしで表示
  };

  return (
    <div>
      <div className="flex justify-center min-h-[5vh]">
        {!permissionGranted && (
          <motion.button
            whileTap={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={requestPermission}
            className="px-4 py-2 flex items-center justify-center text-center bg-blue-100 text-gray-600 rounded-2xl text-xl"
            style={{
              fontFamily: "NicoMoji",
              boxShadow: "0 6px 3px #6495ed",
              border: "none",
            }}
          >
            センサーの許可
          </motion.button>
        )}
      </div>
      <div className="h-[50vh] flex items-center justify-center">
        {/* 円と距離表示 */}
        <div className=" mt-10 w-[45vh] h-[45vh] relative flex items-center justify-center">
          {/* 矢印画像 */}
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[100%] h-[100%] relative">
                <Image
                  src="/arrow.png"
                  alt="方向を示す矢印"
                  fill
                  style={{
                    transform: `rotate(${arrowRotation}deg)`,
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 中央に距離表示 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white bg-opacity-70 rounded-full p-4">
              <p
                className="text-xl text-gray-500"
                style={{ fontFamily: "NicoMoji" }}
              >
                目的地まで
              </p>
              <p
                className="text-4xl font-semibold"
                style={{ color: "#7d7d7d" }}
              >
                {formatDistance(distance)}
              </p>

              <div className="mt-2">
                <p
                  className="text-lg text-gray-500"
                  style={{ fontFamily: "NicoMoji" }}
                >
                  高さ{" "}
                  {height > 0
                    ? `+ ${formatHeight(height)}`
                    : formatHeight(height)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowDistance;
