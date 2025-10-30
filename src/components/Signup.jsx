import React, { useState, useEffect } from "react";
import authService from "../appwrite/auth";
import { useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Popup, Loading } from "./index";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  const create = async (data) => {
    setPopup({ show: false, message: "", type: "" });
    setLoading(true);

    try {
      if (!data.password || data.password.length < 8) {
        setPopup({ show: true, message: "Password must be at least 8 characters long", type: "error" });
        setLoading(false);
        return;
      }

      await authService.createAccount({
        email: data.email,
        password: data.password,
        name: data.username || data.name,
        bio: data.bio || "",
        dob: data.dob || "",
      });

      await authService.account.createVerification(window.location.origin + "/login");
      setOtpSent(true);

      const user = await authService.getCurrentUser();
      if (user) {
        dispatch(authLogin({ name: user.name, email: user.email, $id: user.$id }));

        setPopup({ show: true, message: "Account created successfully!", type: "success" });

        setTimeout(() => navigate("/all-posts"), 1500);
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setPopup({ show: true, message: err.message || "Signup failed. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err) {
      console.error("Google login failed:", err);
      setPopup({ show: true, message: "Google sign-in failed. Try again.", type: "error" });
    }
  };

  if (loading) return <Loading message="Creating your account..." />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 relative">
      {popup.show && <Popup message={popup.message} type={popup.type} fade />}

      <div className="w-full max-w-md p-7 bg-white rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign up to create account</h2>
        <p className="mt-4 text-center text-gray-500 text-sm max-w-md mx-auto">
          Looks like you’re new here!{" "}
          <span className="text-blue-600 font-medium">Create your account</span> to get started.
        </p>

        {otpSent && (
          <p className="text-green-600 mt-4 text-center text-sm">
            Verification email sent! Please check your inbox.
          </p>
        )}

        <form onSubmit={handleSubmit(create)} className="mt-6 space-y-5">
          <Input label="Name / Username:" placeholder="Enter your name" {...register("username", { required: true })} />
          <Input
            label="Email:"
            placeholder="Enter your email"
            type="email"
            {...register("email", {
              required: true,
              validate: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Email must be valid",
            })}
          />
          <Input label="Password:" type="password" placeholder="Enter your password" {...register("password", { required: true })} />
          <Input label="Bio (optional):" placeholder="Tell us about yourself" {...register("bio")} />
          <Input label="Date of Birth (optional):" type="date" {...register("dob")} />
          <Button type="submit" className="w-full font-medium py-2">Create Account</Button>
        </form>

        <div className="flex items-center my-4">
          <hr className="grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <hr className="grow border-gray-300" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 py-2 rounded-lg transition"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
            <path d="M533.5 278.4c0-17.6-1.5-35.1-4.3-52H272v98.7h146.9c-6.4 34.6-25.4 63.9-54.3 83.4v69.1h87.7c51.3-47.3 80.2-117 80.2-199.2z" fill="#4285F4"/>
            <path d="M272 544.3c73.4 0 134.8-24.3 179.7-65.9l-87.7-69.1c-24.4 16.3-55.9 26-91.9 26-70.7 0-130.6-47.8-152.1-112.1H32.6v70.7C77.1 476.6 169.7 544.3 272 544.3z" fill="#34A853"/>
            <path d="M119.9 319.9c-10.3-30.5-10.3-63.5 0-94l-87.3-70.7c-38.3 75-38.3 164.7 0 239.6l87.3-74.9z" fill="#FBBC05"/>
            <path d="M272 107.7c39.8 0 75.4 13.7 103.6 40.5l77.7-77.7C406.5 24.6 345.1 0 272 0 169.7 0 77.1 67.7 32.6 164.3l87.3 70.7C141.4 155.5 201.3 107.7 272 107.7z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}