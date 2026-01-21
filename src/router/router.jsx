import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import Login from "../pages/Authantication/Login/Login";
import AuthLayout from "../layouts/AuthLayout";
import Register from "../pages/Authantication/Register/register";
import Coverage from "../pages/Coverage/Coverage";
import SendParcel from "../pages/SendParcel/SendParcel";
import PrivateRoute from "../Routes/PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/coverage",
        element: <Coverage />,
        loader: async () => {
          const response = await fetch('/ServiceCenter.json');
          if (!response.ok) {
            return [];
          }
          const data = await response.json();
          return data;
        },
      },
      {
        path: "/send-parcel",
        element: <PrivateRoute><SendParcel /></PrivateRoute>,
        loader: async () => {
          const response = await fetch('/ServiceCenter.json');
          if (!response.ok) {
            return [];
          }
          const data = await response.json();
          return data;
        },
      }
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);
