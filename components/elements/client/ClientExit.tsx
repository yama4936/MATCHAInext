"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import useSound from "use-sound";

const ClientExit = () => {
  const router = useRouter();
  const [stop] = useSound("/sonor.mp3", { volume: 0.5, loop: false });

  const handleExitRoom = () => {
    stop();
    router.push("/");
  };

  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        onClick={handleExitRoom}
        className="ml-7 px-4 py-2 rounded-4xl bg-white"
        style={{
          color: "#7d7d7d",
          fontFamily: "NicoMoji",
          boxShadow: "2px 6px 3px #dee6ee",
          border: "none",
        }}
      >
        <p className="text-3xl">← ルーム 退出 test</p>
      </motion.button>
    </div>
  );
};

export default ClientExit;
