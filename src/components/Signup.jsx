import React, { useState, useEffect } from "react";
import authService from "../appwrite/auth";
import { useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Popup, Loading , Logo } from "./index";
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


  if (loading) return <Loading message="Creating your account..." />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 relative">
      {popup.show && <Popup message={popup.message} type={popup.type} fade />}

      <div className="w-full max-w-md p-7 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-center mb-4">
          <Logo width="80px" />
        </div>
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
      </div>
    </div>
  );
}