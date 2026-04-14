import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { TbBikeFilled, TbBikeOff } from "react-icons/tb";
import Swal from "sweetalert2";


const AssignRiders = () => {
  const axiosSecure = useAxiosSecure();
  const riderModalRef = useRef(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const { data: parcels = [], refetch: parcelRefetch } = useQuery({
    queryKey: ["parcels", "pending_delivery"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/parcels?delivery_status=pending_delivery`,
      );
      return res.data;
    },
  });

  const senderRegion = selectedParcel?.senderRegion;
  const { data: riders = [], refetch: riderRefetch } = useQuery({
    queryKey: ["riders", "available", senderRegion],
    enabled: !!senderRegion,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/riders?status=approved&working_status=available&region=${senderRegion}`,
      );
      return res.data;
    },
  });

  const OpenRiderModal = (parcel) => {
    riderModalRef.current.showModal();
    setSelectedParcel(parcel);
  };

  const handleAssignRider = (rider) => {
    const riderAssignInfo = {
     riderId: rider._id,
     riderName: rider.displayName,
     riderPhone: rider.phone,
     riderEmail: rider.applicantEmail,
     parcelId: selectedParcel._id,
     trackingId: selectedParcel.trackingID,
    };
    axiosSecure.patch(`/parcels/${selectedParcel._id}`, riderAssignInfo,
    )
    .then(res => {
      if(res.data.result?.modifiedCount > 0) {
        riderModalRef.current.close();
        parcelRefetch();
        riderRefetch();
        Swal.fire({
          icon: "success",
          title: "Rider assigned successfully",
        });
      }else{
        Swal.fire({
          icon: "error",
          title: "Failed to assign rider",
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th> No. </th>
            <th>Parcel Name</th>
            <th>Type</th>
            <th>Cost</th>
            <th>Created At</th>
            <th>Sender Region</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((parcel, index) => (
            <tr key={parcel._id}>
              <th>{index + 1}</th>
              <td>{parcel.parcelName}</td>
              <td>{parcel.parcelType}</td>
              <td>{parcel.price}</td>
              <td>{parcel.createdAt}</td>
              <td>{parcel.senderRegion}</td>
              <td className="flex gap-1">
                <button
                  onClick={() => OpenRiderModal(parcel)}
                  className="btn btn-success text-xl"
                >
                  <TbBikeFilled />{" "}
                </button>
                <button className="btn btn-error text-xl">
                  <TbBikeOff />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dialog
        ref={riderModalRef}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">Riders: {riders.length}</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider, index) => (
                  <tr key={rider._id}>
                    <th>{index + 1}</th>
                    <td>{rider.displayName}</td>
                    <td>{rider.phone}</td>
                    <td>
                      <button onClick={() => handleAssignRider(rider)} className="btn btn-primary">Assign</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-action">
            <form method="dialog">
              
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AssignRiders;
