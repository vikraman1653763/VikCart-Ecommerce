import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,           // React node for footer actions (buttons)
  icon,              // Optional icon node (e.g., your red trash circle)
  size = "md",       // "sm" | "md" | "lg"
  closeOnOverlay = true,
  closeOnEsc = true,
  className = "",
}) {
  const dialogRef = useRef(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeOnEsc, onClose]);

  // Click outside to close
  const onBackdropClick = (e) => {
    if (!closeOnOverlay) return;
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const sizeClass =
    size === "sm"
      ? "w-[360px]"
      : size === "lg"
      ? "w-[720px]"
      : "w-[460px]"; // default md

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      onMouseDown={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`relative bg-white shadow-md rounded-xl py-6 px-5 ${sizeClass} max-w-full border border-gray-200 ${className}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="flex items-center justify-center p-3 bg-red-100 rounded-full">
              {icon}
            </div>
          ) : null}
          {title ? (
            <h2 id="modal-title" className="text-gray-900 font-semibold text-xl">
              {title}
            </h2>
          ) : null}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto rounded-md p-1 hover:bg-gray-100 text-gray-500"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="mt-4">{children}</div>

        {/* Footer */}
        {actions ? <div className="mt-5">{actions}</div> : null}
      </div>
    </div>,
    document.body
  );
}
