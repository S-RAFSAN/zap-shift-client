import React from "react";
import { CardElement, useElements } from "@stripe/react-stripe-js";
import { useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import Swal from "sweetalert2";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": {
        color: "#9ca3af",
      },
      iconColor: "#6b7280",
    },
    invalid: {
      color: "#dc2626",
      iconColor: "#dc2626",
    },
  },
};

const PaymentForm = () => {
  console.log("PaymentForm component mounted");
  const axiosSecure = useAxiosSecure();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { parcelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  console.log("parcelId from URL:", parcelId);

  const {
    data: parcelInfo = {},
    isLoading: parcelLoading,
    error: parcelError,
  } = useQuery({
    queryKey: ["parcel-info", parcelId],
    queryFn: async () => {
      console.log("Fetching parcel info for:", parcelId);
      const res = await axiosSecure.get(`/parcels/${parcelId}`);
      console.log("Backend response:", res.data);

      // Handle different response structures
      if (res.data?.parcel) {
        return res.data.parcel;
      } else if (res.data) {
        return res.data;
      }
      throw new Error("No parcel data in response");
    },
    enabled: !!parcelId,
  });
  console.log("parcelInfo:", parcelInfo);

  const amount = parcelInfo?.price || 0;

  const amountInCents = amount * 100;
  console.log("amountInCents:", amountInCents);

  if (parcelLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (parcelError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="alert alert-error max-w-md">
          <span>
            Error loading parcel: {parcelError?.message || "Unknown error"}
          </span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("[Payment] handleSubmit called");
    setError(null);
    setSuccess(null);
    if (!stripe || !elements) {
      console.log("[Payment] stripe or elements missing, returning");
      return;
    }

    const card = elements.getElement(CardElement);
    if (card === null) {
      console.log("[Payment] card element null, returning");
      return;
    }

    setProcessing(true);
    try {
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card,
        });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setProcessing(false);
        return;
      }
      console.log("[Payment] createPaymentMethod OK, calling backend...");
      const res = await axiosSecure.post("/create-payment-intent", {
        amount: amountInCents,
        parcelId,
      });

      const clientSecret = res.data.clientSecret;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: user.email,
            name: user.displayName,
          },
        },
      });
      if (result.error) {
        setError(result.error.message || "Payment failed");
      } else {
        setSuccess("Payment successful!");
        const transactionId = result.paymentIntent?.id || "N/A";
        const paymentData = {
          amount: amountInCents,
          parcelId,
          paymentMethod: paymentMethod.id,
          paymentStatus: "paid",
          paymentDate: new Date().toISOString(),
          paymentCurrency: "BDT",
          creatorEmail: user?.email,
          transactionId,
        };
        try {
          await axiosSecure.post("/payments", paymentData);
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["parcel-info", parcelId],
            }),
            queryClient.invalidateQueries({ queryKey: ["all-parcels"] }),
            queryClient.invalidateQueries({
              queryKey: ["payments", user?.email],
            }),
          ]);
        } catch (payErr) {
          console.warn(
            "Could not save payment record (backend may not have /payments):",
            payErr?.response?.status
          );
        }
        await Swal.fire({
          icon: "success",
          title: "Payment Successful",
          html: `<p>Your payment has been completed.</p><p class="mt-3 font-semibold">Transaction ID: <span class="text-primary">${transactionId}</span></p>`,
          confirmButtonText: "OK",
          confirmButtonColor: "#C8E564",
        });
        navigate("/dashboard/myParcels");
      }
      setProcessing(false);
    } catch (err) {
      console.error("Payment intent error:", err);
      console.error("Response:", err?.response?.data);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Payment failed"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-base-100 rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Payment</h1>
          <p className="text-base-content/70 text-center text-sm mb-6">
            Enter your card details to complete payment
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-base-content mb-2">
                Card Details
              </label>
              <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-[#C8E564] focus-within:ring-2 focus-within:ring-[#C8E564]/30 transition-all">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success py-2 text-sm">
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!stripe || processing}
              className="btn w-full bg-[#C8E564] hover:bg-[#b3d659] text-[#03373D] font-semibold border-0"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </span>
              ) : (
                `Pay Now ৳${amount}`
              )}
            </button>
          </form>

          <p className="text-xs text-base-content/50 text-center mt-4">
            Your payment information is secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
