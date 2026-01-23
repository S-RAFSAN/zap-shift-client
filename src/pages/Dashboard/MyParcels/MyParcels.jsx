import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MyParcels = () => {
    const {user} = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const {data: response, isLoading, error} = useQuery({
        queryKey: ['parcels', user?.email],
        queryFn: async () => {
            try {
                // Try with creatorEmail parameter (as parcels use creatorEmail field)
                const res = await axiosSecure.get(`/parcels?creatorEmail=${user?.email}`);
                return res.data;
            } catch (err) {
                console.error('API Error:', err);
                // If creatorEmail doesn't work, try email parameter
                try {
                    const res = await axiosSecure.get(`/parcels?email=${user?.email}`);
                    return res.data;
                } catch (fallbackErr) {
                    console.error('Fallback API Error:', fallbackErr);
                    throw err;
                }
            }
        },
        enabled: !!user?.email // Only run query when user email exists
    })
    
    // Handle different response structures
    let parcels = [];
    if (response) {
        if (Array.isArray(response)) {
            parcels = response;
        } else if (response?.data && Array.isArray(response.data)) {
            parcels = response.data;
        } else if (response?.parcels && Array.isArray(response.parcels)) {
            parcels = response.parcels;
        }
        
        // Client-side filtering as fallback (in case backend doesn't filter)
        // Filter by creatorEmail field (as used in SendParcel)
        if (user?.email && parcels.length > 0) {
            const filtered = parcels.filter(parcel => 
                parcel.creatorEmail === user.email || 
                parcel.email === user.email ||
                parcel.userEmail === user.email
            );
            if (filtered.length !== parcels.length) {
                console.warn('Backend returned all parcels, filtering client-side');
                parcels = filtered;
            }
        }
    }

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    }

    // Format currency function
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A';
        return `৳${parseFloat(amount).toFixed(2)}`;
    }

    // Handle actions
    const handleView = (parcel) => {
        console.log('View parcel:', parcel);
        // TODO: Implement view modal or navigate to detail page
    }

    const handlePay = (parcel) => {
        console.log('Pay for parcel:', parcel);
        // TODO: Implement payment functionality
    }

    const handleDelete = async (parcel) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/parcels/${parcel._id || parcel.id}`);
                    queryClient.invalidateQueries({ queryKey: ['parcels', user?.email] });
                    Swal.fire(
                        'Deleted!',
                        'Your parcel has been deleted.',
                        'success'
                    );
                } catch (err) {
                    console.error('Delete error:', err);
                    const status = err?.response?.status;
                    const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message;

                    // 404 = parcel not in DB (created elsewhere, already deleted, or wrong DB)
                    if (status === 404) {
                        queryClient.invalidateQueries({ queryKey: ['parcels', user?.email] });
                        Swal.fire({
                            icon: 'info',
                            title: 'Parcel not found',
                            text: msg || 'This parcel may have been deleted or does not exist in the database. The list has been refreshed.',
                            confirmButtonColor: '#3085d6',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: msg || 'Failed to delete parcel. Please try again.',
                        });
                    }
                }
            }
        });
    }
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="alert alert-error">
                <span>Error: {error.message}</span>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">My Parcels</h2>
                <p className="text-gray-600 mt-1">Total: {parcels.length} parcel(s)</p>
            </div>

            {parcels.length === 0 ? (
                <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>No parcels found. Create your first parcel to get started!</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Created At</th>
                                <th>Cost</th>
                                <th>Payment Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcels.map((parcel) => {
                                const paymentStatus = parcel.paymentStatus || parcel.paid ? 'paid' : 'unpaid';
                                const isPaid = paymentStatus === 'paid';
                                
                                return (
                                    <tr key={parcel._id || parcel.id}>
                                        <td>
                                            <div className="badge badge-outline">
                                                {parcel.parcelType === 'document' ? '📄 Document' : '📦 Non-Document'}
                                            </div>
                                        </td>
                                        <td>{formatDate(parcel.createdAt)}</td>
                                        <td className="font-semibold">{formatCurrency(parcel.price)}</td>
                                        <td>
                                            <div className={`badge ${isPaid ? 'badge-success' : 'badge-error'} gap-2`}>
                                                {isPaid ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                        Paid
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                        </svg>
                                                        Unpaid
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleView(parcel)}
                                                    className="btn btn-sm btn-info btn-outline"
                                                    title="View Details"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.011 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.011-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    View
                                                </button>
                                                {!isPaid && (
                                                    <button 
                                                        onClick={() => handlePay(parcel)}
                                                        className="btn btn-sm btn-success"
                                                        title="Pay Now"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75m15 0h.75M15 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm3.75 0a.75.75 0 00-.75-.75H15m.75 0a.75.75 0 01.75.75m-.75 0h.008v.007H15V10.5z" />
                                                        </svg>
                                                        Pay
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(parcel)}
                                                    className="btn btn-sm btn-error btn-outline"
                                                    title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyParcels;