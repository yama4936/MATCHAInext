"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const HostExit = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleExitRoom = () => {
    router.push("/");
  };

  const openExitModal = () => {
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        onClick={openExitModal}
        className="ml-7 px-4 py-2 rounded-4xl bg-white"
        style={{
          color: "#7d7d7d",
          fontFamily: "NicoMoji",
          boxShadow: "2px 6px 3px #dee6ee",
          border: "none",
        }}
      >
        <p className="text-3xl">← ルーム退出</p>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-[#f9f8f7] rounded-3xl p-6 w-72 shadow-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <p
                className="text-center mt-3 mb-8 text-2xl"
                style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
              >
                本当に退出しますか？
              </p>

              <motion.button
                onClick={() => {
                  closeModal();
                  handleExitRoom();
                }}
                whileTap={{ scale: 0.8, y: 2, boxShadow: "0 1px 1px #dee6ee" }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="px-5 py-2 rounded-4xl bg-white text-2xl items-center justify-center flex"
                style={{
                  color: "#7d7d7d",
                  fontFamily: "NicoMoji",
                  boxShadow: "2px 6px 3px #dee6ee",
                  border: "none",
                }}
              >
                ルームを退出する
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostExit;
