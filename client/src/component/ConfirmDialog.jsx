import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Do you really want to continue? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger", // "danger" | "primary"
}) {
  const icon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75"
        stroke="#DC2626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const confirmBtnClass =
    confirmVariant === "danger"
      ? "text-white bg-red-600 hover:bg-red-700"
      : "text-white bg-blue-600 hover:bg-blue-700";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={
        <div className="flex items-center justify-center">
          {icon}
        </div>
      }
      actions={
        <div className="flex items-center justify-center gap-4 w-full">
          <button
            type="button"
            className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`w-full md:w-36 h-10 rounded-md font-medium text-sm active:scale-95 transition ${confirmBtnClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-600 mt-2 text-center whitespace-pre-line">
        {message}
      </p>
    </Modal>
  );
}
