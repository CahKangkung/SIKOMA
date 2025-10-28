// src/components/LandingPage.jsx
import React from "react";
import logo from "../assets/logo.png";
import wave from "../assets/background-landingpage.png";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate = useNavigate();
  return (
    <section className="relative min-h-screen overflow-hidden bg-white isolate">
      {/* BACKGROUND WAVE */}
      <img
        src={wave}
        alt=""
        aria-hidden="true"
        className="
          pointer-events-none select-none
          absolute inset-0 -z-10
          h-full w-full object-cover
          md:object-contain md:object-right-bottom
        "
      />

      {/* NAVBAR */}
      {/* <header className="relative z-20 "> */}
        <div className=" relative mx-auto px-6 md:px-10 pt-6 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SIKOMA logo" className="h-8 w-auto md:h-10" />
          </div>
        </div>
      {/* </header> */}

      {/* HERO CONTENT */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 md:px-10 pt-16 md:pt-24 pb-24 md:pb-32">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-800 max-w-3xl">
          WELCOME TO SIKOMA
        </h1>
        <p className="mt-6 text-neutral-600 text-lg md:text-xl max-w-2xl">
          Simplify, track and connect with SIKOMA
        </p>
        <div className="mt-10">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center rounded-xl bg-[#23358B] px-8 py-4 text-white text-lg font-semibold shadow-sm hover:opacity-90 transition"
            >
            Get Started
            </button>
        </div>
      </div>
    </section>
  );
}
