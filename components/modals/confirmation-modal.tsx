import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RxCross1 } from "react-icons/rx";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-[#f9f8f7] p-8 rounded-3xl shadow-lg relative w-full max-w-sm sm:max-w-md flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full"
            >
              <RxCross1 size={22} />
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mt-8 mb-5 text-center">
              メッセージを削除しますか？
            </h2>
            <p className="text-gray-600 mb-4 text-center whitespace-pre-wrap text-sm sm:text-base">
              この操作は取り消せません。
            </p>
            <div className="flex sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 w-full mt-2">
              <motion.button
                whileTap={{ scale: 0.8, y: 2, boxShadow: "0 1px 1px #dd7373" }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-3xl bg-red-500 text-white text-lg items-center justify-center flex w-full sm:w-auto min-w-[140px]"
                style={{
                  fontFamily: "NicoMoji",
                  boxShadow: "2px 6px 3px #fca5a5",
                  border: "none",
                }}
              >
                削除
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
