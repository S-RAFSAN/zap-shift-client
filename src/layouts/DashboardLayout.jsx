import React from 'react';
import { Outlet } from 'react-router';
import ProFastLogo from '../router/shared/Navbar/Profast/ProFastLogo';
import Navbar from '../router/shared/Navbar/Navbar';
import { NavLink } from 'react-router';

const DashboardLayout = () => {
    return (
        <div>
            <Navbar />
            <div className="drawer lg:drawer-open">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <div className="navbar bg-base-200 w-full lg:hidden">
                        <div className="flex-none lg:hidden">
                            <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="inline-block h-6 w-6 stroke-current"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    ></path>
                                </svg>
                            </label>
                        </div>
                        <div className="mx-2 flex-1 px-2 font-semibold">Dashboard</div>
                    </div>
                    <div className="flex-1 p-4">
                        <Outlet />
                    </div>
                </div>
                <div className="drawer-side">
                    <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                    <ul className="menu bg-base-200 min-h-full w-48 p-4">
                        
                        <li className="text-xl font-bold mt-4"><NavLink to="/">Home</NavLink></li>
                        <li className="text-xl font-bold"><NavLink to="/dashboard/myParcels">My Parcels</NavLink></li>
                        <li className="text-xl font-bold"><NavLink to="/dashboard/my-orders">Orders</NavLink></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;