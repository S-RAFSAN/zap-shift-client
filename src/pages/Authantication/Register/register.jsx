import React from "react";
import { useForm } from "react-hook-form";
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

  const password = watch("password");
  const onSubmit = (data) => {
    console.log(data.email, data.password);
    createUser(data.email, data.password)
    .then(result => {
      console.log(result.user);
    })
    .catch(error => {
      console.log(error);
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body">
          <fieldset className="fieldset">
            <h1 className="text-3xl font-bold mb-4">Create an account!</h1>
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
            
            <button className="btn btn-primary mt-4">Register</button>
          </fieldset>
          <div>
              <p className="text-center">Already have an account? <span className="text-primary link link-hover ml-2" ><NavLink to="/login">Login</NavLink></span></p>
              </div>
              <SocialLogin />
        </div>
      </div>
    </form>
  );
};

export default Register;
