"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoChatbubblesOutline, IoSendSharp } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { addMessages, getAllMessages, getUserRoomPass, subscribeToMessages } from "@/utils/supabaseFunction";

export type Message = {
  id: number;
  user_id: number;
  user_name: string;
  room_pass: number;
  created_at: string;
  message: string;
};

const ChatModal = () => {
  const [showChatModal, setChatModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomPass, setRoomPass] = useState<number | null>(null);
  const userId = Number(localStorage.getItem("id"));
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getAllMessages();
      if (data){
        setMessages(data)
      };
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const fetchRoomPass = async () => {
      const roomPass = await getUserRoomPass();
      setRoomPass(roomPass);
    };
    fetchRoomPass();
  }, []);

  useEffect(() => {
    if (!roomPass) return;

    const unsubscribe = subscribeToMessages(roomPass, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      unsubscribe();
    };
  }, [roomPass]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChatModal = () => {
    setChatModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeChatModal = () => {
    setChatModal(false);
    document.body.style.overflow = "auto";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await addMessages(message, roomPass!);
    setMessage("");
  };

  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.8, rotate: -45 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        onClick={openChatModal}
        className="ml-15 px-3 py-3 rounded-4xl bg-white"
      >
        <IoChatbubblesOutline className="text-3xl text-gray-600" />
      </motion.button>

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
              className="bg-white p-8 rounded-2xl relative w-[90%] max-w-md h-[75%] border-4 border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeChatModal}
                className="absolute top-3 right-3 text-3xl text-gray-400"
              >
                <RxCross1 />
              </button>

              <div className="mt-5 rounded-xl flex-grow overflow-y-auto p-4 space-y-2 h-[60%] border-2 border-gray-200">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg w-fit max-w-[80%] text-white ${
                      message.user_id === userId
                        ? "bg-blue-500 ml-auto"
                        : "bg-gray-500"
                    }`}
                  >
                    <div className="text-xs text-gray-300">
                      <span>{message.user_name}</span>
                      <span className="ml-2">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>{message.message}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatModal;
