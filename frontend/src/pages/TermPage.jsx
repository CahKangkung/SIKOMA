// src/pages/TermsPage.jsx
import React from "react";
import TermsContent from "../components/TermContent";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          Terms of Service & Privacy Policy — SIKOMA
        </h1>
        <TermsContent />
      </div>
    </div>
  );
}
