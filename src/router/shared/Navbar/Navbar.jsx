import React from "react";
import { Link, NavLink } from "react-router";
import ProFastLogo from "./Profast/ProFastLogo";
import useAuth from "../../../hooks/useAuth";

import {
  HiHome,
  HiMap,
  HiViewGrid,
  HiPaperAirplane,
  HiLocationMarker,
  HiOutlineIdentification,
} from "react-icons/hi";

const Navbar = () => {
  const { user, logOut } = useAuth();
  const handleLogout = () => {
    logOut()
    .then(result => {console.log("Logged out");})
    .catch(error => {console.error("Error logging out", error);});
  };
  const iconClass = "h-5 w-5 shrink-0";
  const navItems = (
    <>
      <li>
        <NavLink to="/" className="flex items-center gap-2">
          <HiHome className={iconClass} /> Home
        </NavLink>
      </li>
      {user && (
        <li>
          <NavLink
            to="/dashboard/myParcels"
            className="flex items-center gap-2"
          >
            <HiViewGrid className={iconClass} /> Dashboard
          </NavLink>
        </li>
      )}
      <li>
        <NavLink to="/track" className="flex items-center gap-2">
          <HiLocationMarker className={iconClass} /> Track Parcel
        </NavLink>
      </li>
      <li>
        <NavLink to="/coverage" className="flex items-center gap-2">
          <HiMap className={iconClass} /> Coverage
        </NavLink>
      </li>

      <li>
        <NavLink to="/send-parcel" className="flex items-center gap-2">
          <HiPaperAirplane className={iconClass} /> Send Parcel
        </NavLink>
      </li>
      {user && (
        <li>
          <NavLink
            to="/dashboard/beARaider"
            className="flex items-center gap-2"
          >
            <HiOutlineIdentification className={iconClass} /> Be a Rider
          </NavLink>
        </li>
      )}
    </>
  );

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {navItems}
          </ul>
        </div>
        <ProFastLogo />
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navItems}</ul>
      </div>
      <div className="navbar-end">
        {user ? 
        <button className="btn bg-[#C8E564] text-black hover:bg-[#b3d659] text-base px-4 rounded-full" onClick={handleLogout}>Logout</button>
        :
          <Link to="/login">
          <button className="btn bg-[#C8E564] text-black hover:bg-[#b3d659] text-base px-4 rounded-full">
            Login
          </button>
        </Link>}
      </div>
    </div>
  );
};

export default Navbar;
