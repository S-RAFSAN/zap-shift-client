import React from "react";
import { Outlet } from "react-router";
import authImg from "../assets/authImage.png";
import ProFastLogo from "../router/shared/Navbar/Profast/ProFastLogo";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl">
        {/* Main content area with background */}
        <div className="bg-base-200 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl">
          {/* Logo at the top inside the background */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center">
            <ProFastLogo />
          </div>
          
          <div className="hero-content flex-col lg:flex-row-reverse gap-4 sm:gap-6 lg:gap-12">
            {/* Image side */}
            <div className="flex-1 flex items-center justify-center w-full lg:w-auto">
              <img
                src={authImg}
                className="max-w-xs sm:max-w-sm md:max-w-md w-full rounded-lg shadow-2xl"
                alt="Authentication"
              />
            </div>
            
            {/* Form side - centered */}
            <div className="flex-1 flex items-center justify-center w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
