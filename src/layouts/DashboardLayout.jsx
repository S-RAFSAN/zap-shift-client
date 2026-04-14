import React from "react";
import { Outlet } from "react-router";
import ProFastLogo from "../router/shared/Navbar/Profast/ProFastLogo";
import { NavLink } from "react-router";
import {
  HiHome,
  HiCube,
  HiMap,
  HiPaperAirplane,
  HiCreditCard,
  HiLocationMarker,
  HiOutlineIdentification,
  HiShieldCheck,
} from "react-icons/hi";
import useRole from "../hooks/useRole";
import { RiEBike2Fill } from "react-icons/ri";
import { GrTasks, GrTask } from "react-icons/gr";
import { ImStatsBars } from "react-icons/im";

const navLinkClass =
  "flex items-center gap-3 text-xl font-bold hover:text-[#c9eb65]";

const DashboardLayout = () => {
  const { role } = useRole();
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <label
          htmlFor="my-drawer-3"
          className="btn drawer-button lg:hidden"
          aria-label="Open drawer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </label>
        <Outlet />
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 min-h-full p-4">
          <ProFastLogo />
          <li className="mt-8">
            <NavLink to="/" className={navLinkClass}>
              <HiHome className="h-6 w-6 shrink-0" /> Home
            </NavLink>
          </li>
          <li className="mt-4">
            <NavLink to="/dashboard/myParcels" className={navLinkClass}>
              <HiCube className="h-6 w-6 shrink-0" /> My Parcels
            </NavLink>
          </li>
          <li className="mt-4">
            <NavLink to="/dashboard/paymentHistory" className={navLinkClass}>
              <HiCreditCard className="h-6 w-6 shrink-0" /> Payment History
            </NavLink>
          </li>
          <li className="mt-4">
            <NavLink to="/dashboard/track" className={navLinkClass}>
              <HiLocationMarker className="h-6 w-6 shrink-0" /> Track Parcel
            </NavLink>
          </li>
          <li className="mt-4">
            <NavLink to="/dashboard/coverage" className={navLinkClass}>
              <HiMap className="h-6 w-6 shrink-0" /> Coverage
            </NavLink>
          </li>
          <li className="mt-4">
            <NavLink to="/dashboard/sendParcel" className={navLinkClass}>
              <HiPaperAirplane className="h-6 w-6 shrink-0" /> Send Parcel
            </NavLink>
          </li>

          {role === "rider" && (
            <>
              <li className="mt-4">
                <NavLink
                  to="/dashboard/AssignedDeliveries"
                  className={navLinkClass}
                >
                  <GrTasks className="h-6 w-6 shrink-0" /> Assigned Deliveries
                </NavLink>
              </li>
              <li className="mt-4">
                <NavLink
                  to="/dashboard/CompletedDeliveries"
                  className={navLinkClass}
                >
                  <GrTask className="h-6 w-6 shrink-0" /> Completed Deliveries
                </NavLink>
              </li>
            </>
          )}

          {role === "admin" && (
            <>
              <li className="mt-4">
                <NavLink to="/dashboard/approveRiders" className={navLinkClass}>
                  <HiOutlineIdentification className="h-6 w-6 shrink-0" />{" "}
                  Approve Rider
                </NavLink>
              </li>
              <li className="mt-4">
                <NavLink
                  to="/dashboard/UsersManagement"
                  className={navLinkClass}
                >
                  <HiShieldCheck className="h-6 w-6 shrink-0" /> Admin Panel
                </NavLink>
              </li>
              <li className="mt-4">
                <NavLink to="/dashboard/assignRider" className={navLinkClass}>
                  <RiEBike2Fill className="h-6 w-6 shrink-0" /> Assign Rider
                </NavLink>
              </li>
              <li className="mt-4">
                <NavLink to="/dashboard/AdminStats" className={navLinkClass}>
                  <ImStatsBars className="h-6 w-6 shrink-0" /> Admin Stats
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
