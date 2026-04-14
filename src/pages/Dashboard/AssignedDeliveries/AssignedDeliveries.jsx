import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MdWork, MdWorkOff } from "react-icons/md";
import Swal from "sweetalert2";

const AssignedDeliveries = () => {
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
    queryKey: ["parcels", user?.email, "ready-for-delivery"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/parcels/riders?riderEmail=${user?.email}&deliveryStatus=ready-for-delivery`,
      );
      return res.data;
    },
  });

  let message = `Parcel is now ${status}`;
  

  const handleDeliveryStatusUpdate = (parcel, status) => {
    const statusInfo = {deliveryStatus: status, parcelId: parcel._id, riderId: parcel.riderId, trackingId: parcel.trackingID};
    axiosSecure.patch(`/parcels/${parcel._id}/status`, statusInfo)
    .then(res => {
      if(res.data.modifiedCount > 0) {
        refetch();
        Swal.fire({
          icon: "success",
          title: message,
          text: "Delivery accepted successfully.",
        });
      }
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Parcels to Deliver ({parcels.length})
      </h1>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>No.</th>
              <th>Receiver Email</th>
              <th>Confirm</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel, index) => (
              <tr key={parcel._id}>
                <td>{index + 1}</td>
                <td>{parcel.receiverEmail}</td>
                <td className="flex gap-1">
                  {
                    parcel.deliveryStatus === "ready-for-delivery" 
                    ? <>
                    <button
                   onClick={() => handleDeliveryStatusUpdate(parcel, "rider_arriving")}
                   className="btn btn-primary">
                    <MdWork />
                  </button>
                  <button className="btn btn-error">
                      <MdWorkOff />
                    </button>
                    </> 
                    : <>
                     <span>Accepted</span>
                    </> 
                    }
                </td>
                <td>
                  <button
                   onClick={() => handleDeliveryStatusUpdate(parcel, "parcel_picked_up")}
                   className="btn btn-outline btn-primary">
                    Mark as Picked Up
                  </button>
                  <button
                   onClick={() => handleDeliveryStatusUpdate(parcel, "parcel_delivered")}
                   className="btn btn-outline btn-success">
                    Mark as Delivered
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedDeliveries;
