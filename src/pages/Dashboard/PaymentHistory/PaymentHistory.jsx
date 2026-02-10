import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
    data: rawData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["payments", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/payments?email=${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  const payments = Array.isArray(rawData)
    ? rawData
    : rawData?.payments ?? rawData?.data ?? [];

  const formatDate = (val) => {
    if (!val) return "N/A";
    try {
      return new Date(val).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(val);
    }
  };

  const formatAmount = (val) => {
    if (val == null) return "N/A";
    const num = Number(val);
    if (Number.isNaN(num)) return String(val);
    return num >= 100 ? `৳${(num / 100).toFixed(0)}` : `৳${num}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <span>
            Error loading payments: {error?.message || "Unknown error"}
          </span>
        </div>
        <p className="text-sm mt-2 text-base-content/70">
          Make sure your backend has GET /payments?email=... and returns an
          array of payments.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      {payments.length === 0 ? (
        <div className="alert alert-info">
          <span>
            No payment history yet. Payments will appear here after you pay for
            a parcel.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id || payment.id || Math.random()}>
                  <td>
                    {formatDate(
                      payment.paymentDate ?? payment.date ?? payment.paidAt
                    )}
                  </td>
                  <td>{formatAmount(payment.amount)}</td>
                  <td>
                    <span
                      className={`badge ${
                        (payment.paymentStatus ?? payment.status) === "paid"
                          ? "badge-success"
                          : "badge-ghost"
                      }`}
                    >
                      {payment.paymentStatus ?? payment.status ?? "N/A"}
                    </span>
                  </td>
                  <td className="font-mono text-sm">
                    {payment.transactionId ?? payment.paymentIntentId ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
