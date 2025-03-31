"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { RxCross1 } from "react-icons/rx";

const Pwa = () => {
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [isPwa, setIsPwa] = useState(true); // デフォルトでtrueにして、判定後にfalseに変更

  // PWAとして実行されているかを判定
  useEffect(() => {
    const checkIfPwa = () => {
      // スタンドアロンモード（ホーム画面から起動）かどうかをチェック
      const isInStandaloneMode = () =>
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      // PWAとして実行されていない場合はfalseに設定
      if (!isInStandaloneMode()) {
        setIsPwa(false);
      }
    };

    // ページ読み込み完了後に判定
    if (typeof window !== "undefined") {
      checkIfPwa();
    }
  }, []);

  const openPwaModal = () => {
    setShowPwaModal(true);
    document.body.style.overflow = "hidden";
  };

  const closePwaModal = () => {
    setShowPwaModal(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div>
      {/* PWA促進テキスト - PWAでない場合のみ表示 */}
      {!isPwa && (
        <div className="mt-20 left-0 right-0 flex justify-center">
          <motion.button
            onClick={openPwaModal}
            whileTap={{ scale: 0.8 }}
            className="bg-white px-4 py-2 rounded-xl shadow-md"
            style={{
              fontFamily: "NicoMoji",
              color: "#7d7d7d",
              boxShadow: "2px 4px 2px #dee6ee",
            }}
          >
            もっと快適に使うために
          </motion.button>
        </div>
      )}

      {/* PWAモーダル */}
      <AnimatePresence>
          {showPwaModal && (
            <motion.div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={closePwaModal}
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
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  onClick={closePwaModal}
                  className="absolute top-5 right-5"
                >
                  <RxCross1 className="text-gray-400 text-xl" />
                </motion.button>

                <h3
                  className="text-center text-2xl mb-6 mt-5"
                  style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
                >
                  もっと快適に
                </h3>

                <div className="flex flex-col items-center">
                  <p
                    className="text-lg leading-relaxed text-center mb-4"
                    style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
                  >
                    MATCHAIはPWAに対応しています。Webブラウザのメニューからホーム画面に追加をすることで、通知機能などが追加されてさらに快適に使うことができます。
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default Pwa;
