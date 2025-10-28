// src/components/FormField.jsx
import React, { useState } from "react";
import { Eye } from "lucide-react";

export default function FormField({ label, type = "text", name, className = "", ...props }) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mt-5 first:mt-0">
      {label && (
        <label className="block text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}

      <div className={isPassword ? "relative" : ""}>
        <input
          type={isPassword && reveal ? "text" : type}
          name={name}
          className={`mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#23358B]/30 ${isPassword ? "pr-12" : ""} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            aria-label="Hold to show password"
            onMouseDown={() => setReveal(true)}
            onMouseUp={() => setReveal(false)}
            onMouseLeave={() => setReveal(false)}
            onTouchStart={() => setReveal(true)}
            onTouchEnd={() => setReveal(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-[#23358B]"
          >
            <Eye className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
