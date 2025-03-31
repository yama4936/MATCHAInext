"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function RotatingSquares() {
  const [positionIndex, setPositionIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionIndex((prev) => (prev + 1) % 4) 
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    
    <div className="w-full flex justify-center items-center h-40">
      <div className="relative w-20 h-20">
        {squares.map((square, index) => (
          <motion.div
            key={index}
            initial={positions[(index + positionIndex) % 4]} // 初期位置
            animate={positions[(index + positionIndex) % 4]} // アニメーション後の位置
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3, ease: "easeInOut", delay: 0 }} 
            className="absolute w-10 h-10 rounded-md"
            style={{ backgroundColor: square.color }}
          />
        ))}
      </div>
    </div>
  )
}

// 4つの四角の色
const squares = [
  { color: "#9fd8ee" }, // 水色
  { color: "#c5e2c2" }, // 緑色
  { color: "#f7c6bd" }, // 橙色
  { color: "#c5a3cb" }, // 紫
]

const positions = [
  { top: 0, left: 0 },  // 左上
  { top: 0, left: 60 }, // 右上
  { top: 60, left: 60 }, // 右下
  { top: 60, left: 0 }, // 左下
]
