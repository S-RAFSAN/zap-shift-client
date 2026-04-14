import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GiTakeMyMoney } from "react-icons/gi";
import Swal from "sweetalert2";


const CompletedDeliveries = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const {
    data: parcels = [],
    refetch,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["parcels", user?.email, "parcel_delivered"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/parcels/riders?riderEmail=${user?.email}&deliveryStatus=parcel_delivered`,
      );
      return res.data;
    },
  });

  const calculatePayment = (parcel) => {
    if(parcel.senderRegion === parcel.receiverRegion) {
      return parcel.price * 0.1;
    } else {
      return parcel.price * 0.1;
    }
  };

  return (
    <div>
      <table className="table table-zebra">
        <thead>
          <tr>
            <th> No. </th>
            <th>Parcel Name</th>
            <th>Created At</th>
            <th>Cost</th>
            <th>Income</th>
            <th>Withdraw</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((parcel, index) => (
            <tr key={parcel._id}>
              <th>{index + 1}</th>
              <td>{parcel.parcelName}</td>
              <td>{parcel.createdAt}</td>
              <td>{parcel.price}</td>
              <td>{calculatePayment(parcel)}</td>
              <td>
                <button className="btn btn-outline btn-success text-2xl">
                  <GiTakeMyMoney />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedDeliveries;
