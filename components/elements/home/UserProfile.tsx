"use client";

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { getUserSettings, updateUserSettings, uploadUserIcon } from '@/utils/supabaseFunction';

import { RxCross1 } from 'react-icons/rx';

// 修正: 型エラーとコードスタイルの統一
const cropToCircle = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img"); // 修正: 型エラーを解消
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject("Failed to load file.");
        return;
      }
      img.src = e.target.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = () => {
      const size = 300; // 出力サイズ（px）
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("Canvas not supported.");
        return;
      }

      // 円形クリップ
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // アスペクト比を保って中央に描画
      const scale = Math.min(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Blobとして出力
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject("Failed to convert to blob.");
        }
      }, "image/png");
    };
  });
};

const UserModal = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userIcon, setUserIcon] = useState("/icons/user_default_icon.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = async () => {
    const userId = localStorage.getItem("id");
    if (userId) {
      await updateUserSettings(userId, userName, userIcon);
      setShowUserModal(false);
    }
  };

  const openUserModal = () => {
    setShowUserModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    document.body.style.overflow = "auto";
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  // ファイルが選択されたときの処理
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const userId = localStorage.getItem("id");
  if (!userId) {
    return;
  }
  const file = e.target.files?.[0];
  console.log("Selected File:", file);

  if (file) {
    e.target.value = ""; // 同じファイルの選択を許可する
    const newIconUrl = await uploadUserIcon(userId, file);
    if (newIconUrl) {
      setUserIcon(newIconUrl); // アイコンURLを更新
    }
  }
};

  // ユーザー設定を読み込む
  useEffect(() => {
    const loadUserSettings = async () => {
      const userId = localStorage.getItem("id");
      if (userId) {
        const settings = await getUserSettings(userId);
        if (settings) {
          setUserName(settings.name || "");
          setUserIcon(settings.icon || "/icons/user_default_icon.png");
        }
      }
    };
    loadUserSettings();
  }, []);

  return (
    <div>

      {/* ユーザーアイコン */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        onClick={openUserModal}
        className="absolute top-4 left-5"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden relative"> {/* サイズを統一 */}
          <Image
            src={userIcon}
            alt="User Icon"
            width={55}
            height={55}
            className="rounded-full object-cover"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      </motion.button>

      {/* ユーザー設定モーダル */}
      <AnimatePresence>
          {showUserModal && (
            <motion.div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={closeUserModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-[#f9f8f7] rounded-3xl p-8 w-80 shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  onClick={closeUserModal}
                  className="absolute top-5 right-5"
                >
                  <RxCross1 className="text-gray-400 text-xl" />
                </motion.button>

                <h3
                  className="text-center text-2xl mb-6 mt-5"
                  style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
                >
                  ユーザー設定
                </h3>

                <div className="flex flex-col items-center space-y-6">
                  {/* アイコン選択 */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleIconClick}
                      className="relative"
                    >
                    <div className="w-20 h-20 rounded-full overflow-hidden relative">
                      <Image
                        src={userIcon}
                        alt="User Icon"
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        unoptimized
                      />
                    </div>
                      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">変更</span>
                      </div>
                    </motion.button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* ユーザー名入力 */}
                  <input
                    type="text"
                    inputMode="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="ユーザー名"
                    className="w-full p-2 text-xl text-center bg-[#ddd] rounded-xl"
                    style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
                  />

                  {/* 保存ボタン */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onClick={handleSaveSettings}
                    className="w-full py-2 bg-white rounded-xl text-xl"
                    style={{
                      fontFamily: "NicoMoji",
                      color: "#7d7d7d",
                      boxShadow: "2px 6px 3px #dee6ee",
                    }}
                  >
                    保存
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}

export default UserModal
