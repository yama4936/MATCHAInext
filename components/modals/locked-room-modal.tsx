"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LockedRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LockedRoomModal: React.FC<LockedRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#f9f8f7] rounded-3xl p-6 shadow-lg max-w-xs sm:max-w-sm w-full mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-center font-bold text-2xl sm:text-3xl mb-4 underline"
              style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
            >
              ロックされています
            </h3>
            <p
              className="text-center text-lg sm:text-xl text-gray-600 mb-5 leading-relaxed"
              style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
            >
              このルームには現在
              <br />
              鍵がかかっています。
              <br />
              ホストが解除するまで
              <br />
              お待ちください。
            </p>
            <div className="flex justify-center">
              <motion.button
                onClick={onClose}
                whileTap={{
                  scale: 0.95,
                  y: 1,
                  boxShadow: "1px 3px 2px #d0d5db",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="px-6 py-2.5 rounded-2xl bg-white text-base sm:text-lg"
                style={{
                  color: "#7d7d7d",
                  fontFamily: "NicoMoji",
                  boxShadow: "2px 6px 3px #dee6ee",
                  border: "none",
                }}
              >
                閉じる
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LockedRoomModal;
