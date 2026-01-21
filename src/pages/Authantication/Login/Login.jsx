import React from 'react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router';
import SocialLogin from '../SocialLogin/SocialLogin';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = (data) => {
      console.log(data);
    };
    return (
      <div>
      <form onSubmit={handleSubmit(onSubmit)}>
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body p-4 sm:p-6">
          <fieldset className="fieldset">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Login to your account!</h1>
                <fieldset className="fieldset">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: true })}
                    className="input"
                    placeholder="Email"
                  />
                  {errors.email && (
                    <span className="text-red-500">Email is required</span>
                  )}
                  <label className="label">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: true, minLength: 6 })}
                    className="input"
                    placeholder="Password"
                  />
                  {errors.password?.type === "required" && (
                    <span className="text-red-500">Password is required</span>
                  )}
                  {errors.password?.type === "minLength" && (
                    <span className="text-red-500">
                      Password must be at least 6 characters
                    </span>
                  )}
                  <div>
                    <a className="link link-hover">Forgot password?</a>
                  </div>
                  <button className="btn btn-primary mt-4">Login</button>
                </fieldset>
            <div>
              <p className="text-center">Don't have an account? <span className="text-primary link link-hover ml-2" ><NavLink to="/register">Register</NavLink></span></p>
              </div>
              <SocialLogin />
          </fieldset>
        </div>
      </div>
      
      </form>
     
      </div>
    );
};

export default Login;

