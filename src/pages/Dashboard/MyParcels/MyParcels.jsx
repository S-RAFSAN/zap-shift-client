import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const MyParcels = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedParcel, setSelectedParcel] = useState(null);

    const { data: allParcels = [], isLoading, error, isError } = useQuery({
        queryKey: ['all-parcels'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/parcels`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    const parcels = allParcels.filter(p => p.creatorEmail === user?.email);

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/parcels/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-parcels'] });
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Parcel deleted successfully.' });
        },
        onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || err?.message || 'Failed to delete.' });
        },
    });

    const payMutation = useMutation({
        mutationFn: (id) => axiosSecure.patch(`/parcels/${id}`, { paymentStatus: 'paid' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-parcels'] });
            Swal.fire({ icon: 'success', title: 'Paid!', text: 'Payment recorded successfully.' });
        },
        onError: (err) => {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || err?.message || 'Failed to update payment.' });
        },
    });

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    const handleDelete = (parcel) => {
        Swal.fire({
            title: 'Delete Parcel?',
            text: `Tracking ID: ${parcel.trackingID}. This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
        }).then((result) => {
            if (result.isConfirmed && parcel._id) {
                deleteMutation.mutate(parcel._id);
            } else if (result.isConfirmed && !parcel._id) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Cannot delete: no ID.' });
            }
        });
    };

    const handlePay = (parcel) => {
        if (parcel.paymentStatus === 'paid') {
            Swal.fire({ icon: 'info', title: 'Already Paid', text: 'This parcel has already been paid.' });
            return;
        }
        Swal.fire({
            title: 'Mark as Paid?',
            text: `Tracking ID: ${parcel.trackingID} - ৳${parcel.price || 0}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, mark paid',
        }).then((result) => {
            if (result.isConfirmed && parcel._id) {
                payMutation.mutate(parcel._id);
            } else if (result.isConfirmed && !parcel._id) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Cannot update: no ID.' });
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4">
                <div className="alert alert-error">
                    <span>Error loading parcels: {error?.message || 'Unknown error'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6">My Parcels ({parcels.length})</h1>

            {parcels.length === 0 ? (
                <div className="alert alert-info">
                    <span>No parcels yet. Create one from the Send Parcel page.</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Created At</th>
                                <th>Cost</th>
                                <th>Payment</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcels.map((parcel) => (
                                <tr key={parcel._id || parcel.trackingID || Math.random()}>
                                    <td>
                                        <span className={`badge ${parcel.parcelType === 'document' ? 'badge-info' : 'badge-warning'}`}>
                                            {parcel.parcelType === 'document' ? 'Document' : 'Non-Document'}
                                        </span>
                                    </td>
                                    <td>{formatDate(parcel.createdAt)}</td>
                                    <td className="font-semibold">৳{parcel.price ?? 0}</td>
                                    <td>
                                        <span
                                            className={`badge font-medium ${
                                                parcel.paymentStatus === 'paid'
                                                    ? 'badge-success bg-green-500'
                                                    : 'badge-error bg-red-500'
                                            }`}
                                        >
                                            {parcel.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setSelectedParcel(parcel)}
                                                className="btn btn-sm btn-ghost"
                                                title="View details"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handlePay(parcel)}
                                                disabled={parcel.paymentStatus === 'paid'}
                                                className="btn btn-sm btn-success"
                                                title="Mark as paid"
                                            >
                                                Pay
                                            </button>
                                            <button
                                                onClick={() => handleDelete(parcel)}
                                                className="btn btn-sm btn-error btn-outline"
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Details Modal */}
            {selectedParcel && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg">Parcel Details</h3>
                        <div className="py-4 space-y-2 text-sm">
                            <p><strong>Tracking ID:</strong> {selectedParcel.trackingID}</p>
                            <p><strong>Type:</strong> {selectedParcel.parcelType === 'document' ? 'Document' : 'Non-Document'}</p>
                            <p><strong>Parcel Name:</strong> {selectedParcel.parcelName || 'N/A'}</p>
                            <p><strong>Weight:</strong> {selectedParcel.parcelWeight} kg</p>
                            <p><strong>Sender:</strong> {selectedParcel.senderName} - {selectedParcel.senderAddress}</p>
                            <p><strong>Receiver:</strong> {selectedParcel.receiverName} - {selectedParcel.receiverAddress}</p>
                            <p><strong>Created At:</strong> {formatDate(selectedParcel.createdAt)}</p>
                            <p><strong>Cost:</strong> ৳{selectedParcel.price ?? 0}</p>
                            <p><strong>Payment:</strong> {selectedParcel.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</p>
                            {selectedParcel.priceBreakdown?.length > 0 && (
                                <div>
                                    <strong>Price Breakdown:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        {selectedParcel.priceBreakdown.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setSelectedParcel(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/50" onClick={() => setSelectedParcel(null)}></div>
                </div>
            )}
        </div>
    );
};

export default MyParcels;
