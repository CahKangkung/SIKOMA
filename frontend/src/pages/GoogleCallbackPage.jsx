// src/pages/GoogleCallbackPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { refetchUser } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // refetch user untuk update context
        await refetchUser();
        
        // redirect ke home setelah user context updated
        navigate("/home", { replace: true });
      } catch (error) {
        console.error("Google callback error:", error);
        navigate("/login?error=auth_failed", { replace: true });
      }
    };

    handleCallback();
  }, [refetchUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="text-lg text-gray-600 mb-2">Completing login...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#23358B] mx-auto"></div>
      </div>
    </div>
  );
}