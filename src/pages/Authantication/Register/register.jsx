import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
import { NavLink } from "react-router";
import SocialLogin from "../SocialLogin/SocialLogin";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const { createUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data) => {
    console.log("[Register] Submitting", data.email);
    setSubmitError(null);
    setUploading(true);
    try {
      await createUser(data.email, data.password);
      console.log("[Register] Success, redirecting to login");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("[Register] Error", error);
      const message =
        typeof error?.message === "string"
          ? error.message
          : error?.code === "auth/email-already-in-use"
          ? "This email is already registered. Try logging in."
          : error?.code === "auth/weak-password"
          ? "Password is too weak."
          : "Registration failed. Please try again.";
      setSubmitError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
        (err) => console.log("[Register] Validation failed", err)
      )}
    >
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body p-4 sm:p-6">
          <fieldset className="fieldset">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              Create an account!
            </h1>

            {submitError && (
              <p
                className="text-error text-sm mb-4 truncate"
                title={submitError}
              >
                {submitError}
              </p>
            )}

            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="Email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="text-red-500">Email is required</span>
            )}
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                maxLength: {
                  value: 20,
                  message: "Password must be less than 20 characters",
                },
              })}
            />
            {errors.password && (
              <span className="text-red-500">{errors.password.message}</span>
            )}
            <label className="label">Confirm Password</label>
            <input
              type="password"
              className="input"
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <span className="text-red-500">
                {errors.confirmPassword.message}
              </span>
            )}

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={uploading}
            >
              {uploading ? "Creating account…" : "Register"}
            </button>
          </fieldset>
          <div>
            <p className="text-center">
              Already have an account?{" "}
              <span className="text-primary link link-hover ml-2">
                <NavLink to="/login">Login</NavLink>
              </span>
            </p>
          </div>
          <SocialLogin />
        </div>
      </div>
    </form>
  );
};

export default Register;
