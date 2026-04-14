import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt, FaUserMinus, FaUserPlus } from "react-icons/fa";
import Swal from "sweetalert2";


const ApproveRiders = () => {
  const axiosSecure = useAxiosSecure();

  const {
    data: riders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["riders", "pending"],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders");
      return res.data;
    },
  });

  const updateRiderStatus = (rider, status) => {
    const updateInfo = { status: status, email: rider.applicantEmail };
    axiosSecure.patch(`/riders/${rider._id}`, updateInfo).then((res) => {
      if (res.data.modifiedCount) {
        refetch();
        Swal.fire({
          timer: 1500,
          text: `${status} successfully`,
          icon: "success",
          showConfirmButton: false,
        });
      }
    });
  };

  const handleApprove = (rider) => {
    updateRiderStatus(rider, "approved");
  };
  const handleReject = (rider) => {
    updateRiderStatus(rider, "rejected");
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
            <th>District</th>
            <th>Application Status</th>
            <th>Work Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {riders.map((rider, index) => (
            <tr key={rider.id}>
              <th>{index + 1}</th>
              <td>{rider.displayName}</td>
              <td>{rider.applicantEmail}</td>
              <td>{rider.district}</td>
              <td>
                {
                  rider.status && <p
                    className={`badge ${rider.status === "approved" ? "badge-success" : rider.status === "pending" ? "badge-warning" : "badge-error"}`}
                  >
                    {rider.status}
                  </p>
                }
              </td>
              <td>
                <p
                  className={`badge ${(rider.workStatus || "available") === "available" ? "badge-success" : rider.workStatus === "unavailable" ? "badge-error" : "badge-warning"}`}
                >
                  {rider.workStatus || "available"}
                </p>
              </td>
              <td className="flex gap-1">
                <button
                  onClick={() => handleApprove(rider)}
                  className="btn btn-success"
                >
                  <FaUserPlus />
                </button>
                <button
                  onClick={() => handleReject(rider)}
                  className="btn btn-error"
                >
                  <FaUserMinus />
                </button>
              </td>
            </tr>
          ))}
          {riders.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center">
                No pending rider applications
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApproveRiders;
