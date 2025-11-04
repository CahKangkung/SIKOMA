import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");

  const handleInput = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });      

      const data = await res.json();

      if (res.ok) {
        alert("Registration Successful!");
        navigate("/login");
      } else {
        throw new Error(`Registration Failed: ${data.message}`);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <AuthLayout title="Get Started Now !" subtitle="Create your account">
      <form onSubmit={handleSubmit}>
        <FormField label="Username" name="username" value={userData.username} onChange={handleInput} />
        <FormField label="Email" type="email" name="email" value={userData.email} onChange={handleInput} />
        <FormField label="Password" type="password" name="password" value={userData.password} onChange={handleInput} />

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" className="accent-[#23358B]" />
          I agree to term & policy
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
          Have an account?{" "}
          <Link to="/login" className="text-[#23358B] hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
