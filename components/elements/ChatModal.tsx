"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  IoChatbubblesOutline,
  IoSendSharp,
  IoImageOutline,
  IoCloseCircleOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import {
  addMessages,
  getAllMessages,
  getUserRoomPass,
  subscribeToMessages,
  uploadChatMessageImage,
  deleteMessage,
} from "@/utils/supabaseFunction";
import Linkify from "react-linkify";
import UrlPreview from "./UrlPreview";
import ConfirmationModal from "../modals/confirmation-modal";

export type Message = {
  id: number;
  user_id: number;
  user_name: string;
  room_pass: number;
  created_at: string;
  message: string;
};

const urlRegex = /(https?:\/\/[^\s]+)/g;
const IMAGE_URL_PREFIX = "IMAGE_URL::";

const ChatModal = () => {
  const [showChatModal, setChatModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomPass, setRoomPass] = useState<number | null>(null);
  const userId =
    typeof window !== "undefined" ? Number(localStorage.getItem("id")) : null;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [messageToDeleteId, setMessageToDeleteId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getAllMessages();
      if (data) {
        setMessages(data);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const fetchRoomPass = async () => {
      const pass = await getUserRoomPass();
      setRoomPass(pass);
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
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    document.body.style.overflow = "auto";
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeSelectedImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!roomPass) return;

    if (selectedImageFile) {
      setIsUploadingImage(true);
      const imageUrl = await uploadChatMessageImage(
        selectedImageFile,
        roomPass
      );
      setIsUploadingImage(false);
      if (imageUrl) {
        await addMessages(`${IMAGE_URL_PREFIX}${imageUrl}`, roomPass);
        removeSelectedImage();
      } else {
        alert("画像アップロードに失敗しました。");
      }
    } else if (message.trim()) {
      await addMessages(message, roomPass);
      setMessage("");
    }
  };

  const extractFirstUrl = (text: string): string | null => {
    if (text.startsWith(IMAGE_URL_PREFIX)) return null;
    const urls = text.match(urlRegex);
    return urls && urls.length > 0 ? urls[0] : null;
  };

  const openDeleteConfirmModal = (messageId: number) => {
    setMessageToDeleteId(messageId);
    setShowConfirmationModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (messageToDeleteId === null) return;

    const success = await deleteMessage(messageToDeleteId);
    if (success) {
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== messageToDeleteId)
      );
    } else {
      alert("メッセージの削除に失敗しました。");
    }
    setMessageToDeleteId(null);
  };

  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.8, rotate: -45 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        onClick={openChatModal}
        className="ml-15 px-3 py-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <IoChatbubblesOutline className="text-3xl text-gray-600" />
      </motion.button>

      <AnimatePresence>
        {showChatModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={closeChatModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl relative w-[95%] max-w-lg h-[90%] sm:h-[85%] border border-gray-100 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center ml-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
                  チャット
                </h2>
                <button
                  onClick={closeChatModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <RxCross1 size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 rounded-lg mb-4">
                {messages.map((msg) => {
                  const isImageMsg = msg.message.startsWith(IMAGE_URL_PREFIX);
                  const imageUrl = isImageMsg
                    ? msg.message.substring(IMAGE_URL_PREFIX.length)
                    : null;
                  const firstUrlInText = extractFirstUrl(msg.message);
                  const isMyMessage = msg.user_id === userId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMyMessage ? "items-end" : "items-start"
                      } w-full`}
                    >
                      <div
                        className={`p-2.5 sm:p-3 rounded-xl w-fit max-w-[85%] break-words shadow-md flex flex-col relative group ${
                          isMyMessage
                            ? "bg-sky-500 text-white ml-auto rounded-br-none"
                            : "bg-gray-200 text-gray-800 mr-auto rounded-bl-none"
                        }`}
                      >
                        <div
                          className={`text-xs mb-1 ${
                            isMyMessage ? "text-sky-100" : "text-gray-500"
                          }`}
                        >
                          <span>{msg.user_name}</span>
                          <span className="ml-2">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {isImageMsg && imageUrl ? (
                          <div
                            className="mt-1 max-w-xs sm:max-w-sm mx-auto cursor-pointer"
                            onClick={() => window.open(imageUrl, "_blank")}
                          >
                            <Image
                              src={imageUrl}
                              alt="送信された画像"
                              width={300}
                              height={200}
                              objectFit="contain"
                              className="rounded-lg bg-gray-300"
                            />
                          </div>
                        ) : (
                          <Linkify
                            componentDecorator={(
                              decoratedHref,
                              decoratedText,
                              key
                            ) => (
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={decoratedHref}
                                key={key}
                                className={`${
                                  isMyMessage
                                    ? "text-sky-100 hover:text-white"
                                    : "text-blue-600 hover:text-blue-500"
                                } underline`}
                              >
                                {decoratedText}
                              </a>
                            )}
                          >
                            {msg.message}
                          </Linkify>
                        )}
                        {!isImageMsg && firstUrlInText && (
                          <div className="mt-1.5 -mb-1">
                            <UrlPreview url={firstUrlInText} />
                          </div>
                        )}
                      </div>
                      {isMyMessage && (
                        <div className="mt-0.5 mr-1 self-end">
                          <button
                            onClick={() => openDeleteConfirmModal(msg.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 hover:underline opacity-80 hover:opacity-100 transition-opacity"
                            aria-label="メッセージを削除"
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {imagePreviewUrl && (
                <div className="mb-3 p-2 border border-gray-200 rounded-lg relative max-w-[120px] mx-auto bg-gray-50">
                  <Image
                    src={imagePreviewUrl}
                    alt="選択された画像プレビュー"
                    width={100}
                    height={100}
                    objectFit="cover"
                    className="rounded-md"
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="選択した画像を削除"
                  >
                    <IoCloseCircleOutline size={22} />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 sm:p-3 bg-gray-100 hover:bg-gray-200 text-sky-500 rounded-full disabled:opacity-50 transition-colors"
                  disabled={isUploadingImage}
                  aria-label="画像を選択"
                >
                  <IoImageOutline className="text-xl sm:text-2xl" />
                </motion.button>

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow px-4 py-2.5 sm:py-3 rounded-full border-2 border-gray-200 text-gray-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm sm:text-base"
                  placeholder={
                    selectedImageFile
                      ? "画像を送信します"
                      : "メッセージを入力..."
                  }
                  disabled={isUploadingImage || !!selectedImageFile}
                />
                <motion.button
                  type="submit"
                  disabled={
                    (!message.trim() && !selectedImageFile) ||
                    isUploadingImage ||
                    !roomPass
                  }
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="p-2.5 sm:p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploadingImage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IoSendSharp className="text-xl sm:text-2xl" />
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setMessageToDeleteId(null);
        }}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
};

export default ChatModal;
