"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { IoChatbubblesOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { IoSendSharp } from "react-icons/io5";

const ChatModal = () => {
  const [showChatModal, setChatModal] = useState(false);
  const [message, setMessage] = useState("");

  const openChatModal = () => {
    setChatModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeChatModal = () => {
    setChatModal(false);
    document.body.style.overflow = "auto";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Message sent:", message);
    setMessage("");
  };

  return (
    <div>
      {/* チャットボタン */}
      <div>
        <motion.button
          whileTap={{ scale: 0.8, rotate: -45 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          onClick={openChatModal}
          className="ml-15 px-3 py-3 rounded-4xl bg-white"
          style={{
            color: "#7d7d7d",
            fontFamily: "NicoMoji",
            boxShadow: "0 6px 3px #dee6ee",
            border: "none",
          }}
        >
          <IoChatbubblesOutline className="text-3xl text-gray-600" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showChatModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={closeChatModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white p-8 rounded-2xl relative w-[90%] max-w-md h-[75%] border-4 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onClick={closeChatModal}
                className="absolute top-3 right-3 text-4xl text-gray-400"
              >
                <RxCross1 className="text-gray-400 " />
              </motion.button>
              <div className="flex flex-col h-full">
                <div className="flex-grow"></div>
                <form onSubmit={handleSendMessage} className="flex items-center mt-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow px-3 py-2 rounded-xl border-2 border-gray-300 text-gray-600 text-center"
                    placeholder="メッセージを入力..."
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="ml-2 px-3 py-3 bg-gray-100 text-black rounded-full"
                  >
                    <IoSendSharp className="text-black text-2xl" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatModal;