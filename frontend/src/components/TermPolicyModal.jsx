// src/components/TermsPolicyModal.jsx
import React, { useEffect, useRef } from "react";
import TermsContent from "./TermContent";

export default function TermsPolicyModal({ open, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        tabIndex={-1}
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-3xl rounded-xl bg-white shadow-xl p-6 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 id="terms-title" className="text-lg font-semibold text-neutral-900">
              Terms of Service & Privacy Policy
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-neutral-600 hover:bg-neutral-100"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>

          <TermsContent />

          <div className="mt-6 text-right">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#133962] px-4 py-2 text-white font-medium hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}