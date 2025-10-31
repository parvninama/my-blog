import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import authService from "../appwrite/auth";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Logo, Popup, Loading } from "./index";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ ...popup, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const showPopup = (message, type = "info") => setPopup({ show: true, message, type });

  const login = async (data) => {
    setLoading(true);
    try {
      await authService.login({ email: data.email, password: data.password });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Failed to get user after login");

      dispatch(authLogin({ name: user.name, email: user.email, $id: user.$id }));
      showPopup("Login successful!", "success");
      navigate("/all-posts");
    } catch (err) {
      console.error("Login error:", err);
      let message = err.message || "Login failed";
      if (err.code === 429) message = "Too many requests! Please wait and try again.";
      else if (err.message?.toLowerCase().includes("invalid") || err.message?.toLowerCase().includes("password")) {
        message = "Incorrect email or password. Please try again.";
      }
      showPopup(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 relative">
      {popup.show && <Popup message={popup.message} type={popup.type} fade onClose={() => setPopup({ ...popup, show: false })} />}

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-200 z-10 relative">
        {loading && <Loading message="Logging in..." />}

        <div className="flex justify-center mb-4">
          <Logo width="80px" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">Sign in to your account</h2>
        <p className="mt-2 text-center text-gray-500 text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>

        <form onSubmit={handleSubmit(login)} className="mt-6 space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            className="placeholder-gray-400 placeholder-opacity-50"
            {...register("email", {
              required: "Email is required",
              validate: (value) =>
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Email must be valid",
            })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            className="placeholder-gray-400 placeholder-opacity-50"
            {...register("password", { required: "Password is required" })}
          />
          <Button type="submit" className="w-full font-medium py-2">Sign In</Button>
        </form>
      </div>
    </div>
  );
}

export default Login;