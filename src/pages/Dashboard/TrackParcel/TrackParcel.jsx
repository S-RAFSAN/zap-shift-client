import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { HiSearch } from "react-icons/hi";

const TrackParcel = () => {
  const { trackingId: trackingIdFromUrl } = useParams();
  const [searchParams] = useSearchParams();
  const queryTrackId = searchParams.get("trackingId") || searchParams.get("id");
  const initialTrackId = trackingIdFromUrl || queryTrackId || "";
  const [searchInput, setSearchInput] = useState(initialTrackId);
  const [activeTrackId, setActiveTrackId] = useState(
    initialTrackId ? decodeURIComponent(initialTrackId) : null
  );
  React.useEffect(() => {
    const fromUrl = trackingIdFromUrl || queryTrackId;
    if (fromUrl) {
      const decoded = decodeURIComponent(fromUrl);
      setSearchInput(decoded);
      setActiveTrackId(decoded);
    }
  }, [trackingIdFromUrl, queryTrackId]);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const {
    data: rawData,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tracking", activeTrackId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/tracking?trackingId=${encodeURIComponent(activeTrackId)}`
      );
      return res.data;
    },
    enabled: !!activeTrackId?.trim(),
  });

  const updates = Array.isArray(rawData)
    ? rawData
    : rawData?.tracking ?? rawData?.updates ?? rawData?.data ?? [];

  const handleSearch = (e) => {
    e.preventDefault();
    const id = searchInput?.trim();
    if (!id) return;
    setActiveTrackId(id);
    refetch();
    const path = window.location.pathname;
    if (path.includes("/dashboard")) {
      navigate(`/dashboard/track/${encodeURIComponent(id)}`, { replace: true });
    } else {
      navigate(`/track/${encodeURIComponent(id)}`, { replace: true });
    }
  };

  const formatDate = (val) => {
    if (!val) return "—";
    try {
      return new Date(val).toLocaleString(undefined, {
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

  const sortedUpdates = [...updates].sort(
    (a, b) =>
      new Date(a.createdAt || a.date || 0) -
      new Date(b.createdAt || b.date || 0)
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Track Parcel</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter tracking ID (e.g. TRK-xxx)"
          className="input input-bordered flex-1 bg-base-100"
        />
        <button
          type="submit"
          className="btn bg-[#C8E564] text-[#03373D] hover:bg-[#b3d659]"
        >
          <HiSearch className="h-5 w-5 mr-2" />
          Track
        </button>
      </form>

      {!activeTrackId ? (
        <div className="alert alert-info">
          <span>
            Enter a tracking ID above or open a link like /track/TRK-xxxxx to
            see tracking updates.
          </span>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : isError ? (
        <div className="alert alert-error">
          <span>
            Error loading tracking: {error?.message || "Unknown error"}
          </span>
          <p className="text-sm mt-2 opacity-80">
            Make sure your backend has GET /tracking?trackingId=... and a
            tracking collection with entries for this ID.
          </p>
        </div>
      ) : sortedUpdates.length === 0 ? (
        <div className="alert alert-warning">
          <span>
            No tracking updates found for <strong>{activeTrackId}</strong>.
          </span>
          <p className="text-sm mt-2 opacity-80">
            Updates will appear here once they are added to the tracking
            collection in the database.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-base-content/70 mb-4">
            Tracking ID:{" "}
            <strong className="text-base-content">{activeTrackId}</strong>
          </p>
          <ul className="timeline timeline-vertical">
            {sortedUpdates.map((update, index) => (
              <li key={update._id || index}>
                <hr className="bg-primary" />
                <div className="timeline-start text-xs text-base-content/70">
                  {formatDate(
                    update.createdAt ?? update.date ?? update.timestamp
                  )}
                </div>
                <div className="timeline-middle">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <div className="timeline-end timeline-box mb-4">
                  <p className="font-semibold">
                    {update.status ?? update.title ?? "Update"}
                  </p>
                  {update.message && (
                    <p className="text-sm mt-1">{update.message}</p>
                  )}
                  {update.location && (
                    <p className="text-sm text-base-content/70 mt-1">
                      📍 {update.location}
                    </p>
                  )}
                </div>
                <hr className="bg-primary" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrackParcel;
