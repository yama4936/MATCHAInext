"use client";

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { IoIosInformationCircleOutline } from 'react-icons/io';
import { RxCross1 } from 'react-icons/rx';

const Info = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const openInfoModal = () => {
    setShowInfoModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div>
      {/* 情報アイコン */}
            <motion.button
              whileTap={{ scale: 0.8, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={openInfoModal}
              className="absolute top-5 right-5"
            >
              <IoIosInformationCircleOutline className="text-5xl text-gray-300" />
            </motion.button>

            {/* 説明モーダル */}
        <AnimatePresence>
          {showInfoModal && (
            <motion.div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={closeInfoModal}
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
                  onClick={closeInfoModal}
                  className="absolute top-5 right-5"
                >
                  <RxCross1 className="text-gray-400 text-xl" />
                </motion.button>

                <div className="flex items-center justify-center gap-3 mt-1">
                  <Image
                    src="/title.png"
                    alt="MATCHAI"
                    width={200}
                    height={40}
                  />
                  <h3
                    className="text-xl"
                    style={{ fontFamily: "NicoMoji", color: "#7d7d7d" }}
                  >
                    とは
                  </h3>
                </div>

                <div
                  className="text-gray-600 space-y-4"
                  style={{ fontFamily: "NicoMoji" }}
                >
                  <p className="text-lg leading-relaxed">
                    集合を簡単にしたり、
                    <br />
                    迷子になってもすぐに
                    <br />
                    合流するためのアプリです。
                  </p>
                  <p className="text-lg leading-relaxed">
                    集合場所に着いた人が
                    <br />
                    ルームを作成して、4桁の
                    <br />
                    パスワードを共有します。
                  </p>
                  <p className="text-lg leading-relaxed">
                    他の人は共有された
                    <br />
                    パスワードを入力するだけで、
                    <br />
                    ホストまで距離と、矢印で
                    <br />
                    方向が表示されます。
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}

export default Info
