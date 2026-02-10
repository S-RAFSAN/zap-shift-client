import { useCallback } from "react";
import useAxiosSecure from "./useAxiosSecure";

/**
 * Custom hook for tracking operations. Uses axiosSecure (auth + base URL).
 * Use from any component to add tracking updates or fetch tracking by ID.
 *
 * @returns {{ addTrackingUpdate, getTracking }}
 */
const useTracking = () => {
  const axiosSecure = useAxiosSecure();

  /**
   * POST a new tracking update. Call from admin/worker flows.
   * @param {Object} payload
   * @param {string} payload.trackingId - Required. Tracking ID (e.g. parcel _id or TRK-xxx).
   * @param {string} [payload.parcelId] - Optional. Parcel ID.
   * @param {string} [payload.status] - Optional. e.g. 'dispatched', 'in_transit', 'delivered'. Default 'update'.
   * @param {string} [payload.message] - Optional. Description.
   * @param {string} [payload.location] - Optional. Location string.
   * @returns {Promise<{ insertedId: string, acknowledged: boolean }>}
   */
  const addTrackingUpdate = useCallback(
    async (payload) => {
      const { data } = await axiosSecure.post("/tracking", payload);
      return data;
    },
    [axiosSecure]
  );

  /**
   * GET all tracking updates for a tracking ID (public-style read).
   * @param {string} trackingId - Tracking ID to fetch updates for.
   * @returns {Promise<Array>} Array of tracking update documents.
   */
  const getTracking = useCallback(
    async (trackingId) => {
      if (!trackingId || !String(trackingId).trim()) {
        return [];
      }
      const { data } = await axiosSecure.get("/tracking", {
        params: { trackingId: String(trackingId).trim() },
      });
      return Array.isArray(data)
        ? data
        : data?.tracking ?? data?.updates ?? data?.data ?? [];
    },
    [axiosSecure]
  );

  return { addTrackingUpdate, getTracking, axiosSecure };
};

export default useTracking;
