import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import TermsPolicyModal from "../components/TermsPolicyModal";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState("");
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
      setMessage("You must agree to the Terms of Service & Privacy Policy first.");
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
        alert("Registration successful!");
        navigate("/login");
      } else {
        const msg =
          data?.message ||
          data?.error ||
          `Registration failed (HTTP ${res.status}).`;
        throw new Error(msg);
      }
    } catch (err) {
      setMessage(err.message || "Registration failed.");
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

        {message && <p className="text-red-500 text-sm mt-2">{message}</p>}

        {/* tombol & spacing PERSIS sama seperti login */}
        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-[#133962] py-3 text-white font-semibold hover:opacity-90 transition"
          disabled={loading}
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
  );
}
