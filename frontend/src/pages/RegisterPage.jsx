// src/pages/RegisterPage.jsx
import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import TermsPolicyModal from "../components/TermsPolicyModal";
import { CheckCircle, XCircle } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: "success", // "success" | "error"
    title: "",
    message: "",
    onConfirm: null,
  });

  const showNotification = (type, title, message, onConfirm = null) => {
    setPopupConfig({ type, title, message, onConfirm });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    if (popupConfig.onConfirm) {
      setTimeout(() => {
      popupConfig.onConfirm();
      }, 100);
    }
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleInput = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);
    setMessage("");

    if (!agree) {
      const msg =
        "You must agree to the Terms of Service & Privacy Policy first.";
      setMessage(msg);
      // ✅ tampilkan pop-up juga agar konsisten
      showNotification(
        "error",
        "Agreement Required",
        "You must agree to the Terms of Service & Privacy Policy before creating an account."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // response body may be empty or not JSON
      }

      if (res.ok) {
        showNotification(
          "success",
          "Registration Successful!",
          "Your account has been created.",
          () => navigate("/login")
        );
      } else {
        const msg =
          data?.message ||
          data?.error ||
          `Registration failed (HTTP ${res.status}).`;
        throw new Error(msg);
      }
    } catch (err) {
      const errMsg = err.message || "Registration failed.";
      setMessage(errMsg); 
      showNotification("error", "Registration Failed", errMsg);
    } finally {
      setLoading(false);
    }

  // --------------------KODE LAMA-----------------------------------
  //   try {
  //     const res = await fetch("http://localhost:8080/api/auth/register", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(userData),
  //     });      

  //     const data = await res.json();

  //     if (res.ok) {
  //       alert("Registration Successful!");
  //       navigate("/login");
  //     } else {
  //       throw new Error(`Registration Failed: ${data.message}`);
  //     }
  //   } catch (err) {
  //     setMessage(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  }; 

  return (
    <>
      <AuthLayout title="Get Started Now !" subtitle="Create your account">
        <form onSubmit={handleSubmit}>
          <FormField label="Username" name="username" value={userData.username} onChange={handleInput} />
          <FormField label="Email" type="email" name="email" value={userData.email} onChange={handleInput} />
          <FormField label="Password" type="password" name="password" value={userData.password} onChange={handleInput} />

          {/* ---------------KODE LAMA------------------------- */}
          {/* <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="accent-[#23358B]" />
            I agree to term & policy
          </label> */}

          <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700 select-none">
            <input
              type="checkbox"
              className="accent-[#23358B]"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <button
                type="button"
                className="text-[#23358B] underline hover:opacity-90"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // do not toggle the checkbox
                  setShowTerms(true);
                }}
              >
                Terms of Service & Privacy Policy
              </button>
            </span>
          </label>

          {message && (
            <p className="text-red-500 text-sm mt-2" role="alert" aria-live="polite">
              {message}
            </p>
          )}

          {/* tombol & spacing PERSIS sama seperti login */}
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
            disabled={loading || !agree}
          >
            {loading ? "Register..." : "Register"}
          </button>

          <div className="mt-4 text-center text-sm text-neutral-600">
            Or Login with
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Google
          </button>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-[#23358B] hover:underline">
              Login
            </Link>
          </div>
        </form>

        {/* Terms & Policy modal */}
        <TermsPolicyModal open={showTerms} onClose={() => setShowTerms(false)} />
      </AuthLayout>

      {/* ✅ Pop-up notifikasi success/error (ganti semua alert) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md">
            <div className="flex flex-col items-center text-center">
              {popupConfig.type === "success" ? (
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
              )}

              <h2 className="text-xl font-bold text-[#23358B] mb-2">
                {popupConfig.title}
              </h2>
              <p className="text-gray-700 mb-6">{popupConfig.message}</p>

              <button
                onClick={closePopup}
                className={`px-8 py-2 rounded-md text-white font-semibold transition-all ${
                  popupConfig.type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
