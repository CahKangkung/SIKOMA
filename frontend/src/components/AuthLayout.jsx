import React from "react";
import wave from "../assets/background-loginpage.png"; // sesuaikan path kamu

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden isolate">
      {/* BACKGROUND WAVE */}
      <img
        src={wave}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 -z-10 h-full w-full object-cover md:object-contain md:object-left"
      />

      {/* GRID WRAPPER */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-2 items-center px-6 md:px-10 py-10">
        {/* kiri: wave space */}
        <div className="hidden md:block" />

        {/* kanan: form container */}
        <div className="flex flex-col items-center justify-center w-full">
          <div className="w-full max-w-md text-center">
            {/* TITLE & SUBTITLE */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-800">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-neutral-600">{subtitle}</p>
            )}

            {/* FORM */}
            <div className="mt-8 text-left w-full">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
