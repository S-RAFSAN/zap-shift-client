import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import Login from "../pages/Authantication/Login/Login";
import AuthLayout from "../layouts/AuthLayout";
import Register from "../pages/Authantication/Register/Register";
import Coverage from "../pages/Coverage/Coverage";
import SendParcel from "../pages/SendParcel/SendParcel";
import PrivateRoute from "../Routes/PrivateRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import MyParcels from "../pages/Dashboard/MyParcels/MyParcels";
import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentHistory from "../pages/Dashboard/PaymentHistory/PaymentHistory";
import TrackParcel from "../pages/Dashboard/TrackParcel/TrackParcel";
import BeARaider from "../pages/Dashboard/BeARider/BeARaider";
import ApproveRiders from "../pages/Dashboard/ApproveRiders/ApproveRiders";
import UsersManagement from "../pages/Dashboard/UsersManagement/UsersManagement";
import AdminRoute from "../Routes/AdminRoute";
import AssignRiders from "../pages/Dashboard/AssignRiders/AssignRiders";
import AssignedDeliveries from "../pages/Dashboard/AssignedDeliveries/AssignedDeliveries";
import RiderRoutes from "../Routes/RiderRoutes/RiderRoutes";
import CompletedDeliveries from "../pages/Dashboard/CompletedDeliveries/CompletedDeliveries";
import ParcelTrack from "../pages/ParcelTrack/ParcelTrack";
import DeliveryStats from "../pages/Dashboard/AdminStats/DeliveryStats";

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
          const response = await fetch("/ServiceCenter.json");
          if (!response.ok) {
            return [];
          }
          const data = await response.json();
          return data;
        },
      },
      {
        path: "/parcel-track/:trackingId",
        element: <ParcelTrack />,
      },
      {
        path: "/dashboard/beARaider",
        element: (
          <PrivateRoute>
            <BeARaider />
          </PrivateRoute>
        ),
        loader: async () => {
          const response = await fetch("/ServiceCenter.json");
          if (!response.ok) return [];
          const data = await response.json();
          return data;
        },
      },
      {
        path: "/send-parcel",
        element: (
          <PrivateRoute>
            <SendParcel />
          </PrivateRoute>
        ),
        loader: async () => {
          const response = await fetch("/ServiceCenter.json");
          if (!response.ok) {
            return [];
          }
          const data = await response.json();
          return data;
        },
      },
      {
        path: "track",
        element: <TrackParcel />,
      },
      {
        path: "track/:trackingId",
        element: <TrackParcel />,
      },
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
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "myParcels",
        element: <MyParcels />,
      },
      {
        path: "payment/:parcelId",
        element: <Payment />,
      },
      {
        path: "paymentHistory",
        element: <PaymentHistory />,
      },
      {
        path: "track",
        element: <TrackParcel />,
      },
      {
        path: "track/:trackingId",
        element: <TrackParcel />,
      },
      {
        path: "beARaider",
        element: <BeARaider />,
      },
      {
        path: "coverage",
        element: <Coverage />,
        loader: async () => {
          const response = await fetch("/ServiceCenter.json");
          if (!response.ok) return [];
          const data = await response.json();
          return data;
        },
      },
      {
        path: "sendParcel",
        element: <SendParcel />,
        loader: async () => {
          const response = await fetch("/ServiceCenter.json");
          if (!response.ok) {
            return [];
          }
          const data = await response.json();
          return data;
        },
      },
      
      //Admin Routes
      {
        path: "approveRiders",
        element: <AdminRoute> <ApproveRiders /> </AdminRoute>,
      },
      {
        path: "ApproveRiders",
        element: <AdminRoute> <ApproveRiders /> </AdminRoute>,
      },
      {
        path: "UsersManagement",
        element: <AdminRoute> <UsersManagement /> </AdminRoute>
      },
      {
        path: "assignRider",
        element: <AdminRoute> <AssignRiders /> </AdminRoute>
      },
      {
        path: "AdminStats",
        element: <AdminRoute> <DeliveryStats /> </AdminRoute>
      },
      //Rider Routes
      {
        path: "AssignedDeliveries",
        element: <RiderRoutes> <AssignedDeliveries /> </RiderRoutes>
      },
      {
        path: "CompletedDeliveries",
        element: <RiderRoutes> <CompletedDeliveries /> </RiderRoutes>
      }
    ],
  },
]);
