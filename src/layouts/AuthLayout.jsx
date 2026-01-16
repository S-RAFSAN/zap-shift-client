import React from "react";
import { Outlet } from "react-router";
import authImg from "../assets/authImage.png";
import ProFastLogo from "../router/shared/Navbar/Profast/ProFastLogo";

const AuthLayout = () => {
  return (
    <div className="p-12">
      <div className=" bg-base-200 min-h-screen">
        <div>
          <ProFastLogo />
        </div>
        <div className=" hero-content flex-col lg:flex-row-reverse">
          <div className="flex-1">
            <img
            src={authImg}
            className="max-w-sm rounded-lg shadow-2xl"
          />
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
          </div>
      </div>
    </div>
  );
};

export default AuthLayout;
