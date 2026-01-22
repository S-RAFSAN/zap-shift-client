import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLoaderData } from 'react-router';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const SendParcel = () => {
    const serviceCenters = useLoaderData() || [];
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm({
        mode: 'onChange',
        defaultValues: {
            parcelType: 'document',
            senderWarehouse: '',
            receiverWarehouse: '',
            creatorEmail: '',
            createdAt: ''
        }
    });

    const axiosSecure = useAxiosSecure();

    const parcelType = watch('parcelType');
    const [senderSearchQuery, setSenderSearchQuery] = useState('');
    const [receiverSearchQuery, setReceiverSearchQuery] = useState('');
    const [senderDropdownOpen, setSenderDropdownOpen] = useState(false);
    const [receiverDropdownOpen, setReceiverDropdownOpen] = useState(false);
    
    // State to store all parcels - load from localStorage on mount
    const [parcels, setParcels] = useState(() => {
        const savedParcels = localStorage.getItem('parcels');
        return savedParcels ? JSON.parse(savedParcels) : [];
    });

    // Unique regions derived from service center data (used for region dropdowns)
    const uniqueRegions = useMemo(() => {
        const set = new Set();
        serviceCenters.forEach(center => {
            if (center?.region) {
                set.add(center.region.trim());
            }
        });
        return Array.from(set).sort();
    }, [serviceCenters]);

    // Filter warehouses based on search query
    const filteredSenderWarehouses = useMemo(() => {
        if (!senderSearchQuery.trim()) return serviceCenters;
        const query = senderSearchQuery.toLowerCase();
        return serviceCenters.filter(center => 
            center.district?.toLowerCase().includes(query) ||
            center.city?.toLowerCase().includes(query) ||
            center.region?.toLowerCase().includes(query)
        );
    }, [serviceCenters, senderSearchQuery]);

    const filteredReceiverWarehouses = useMemo(() => {
        if (!receiverSearchQuery.trim()) return serviceCenters;
        const query = receiverSearchQuery.toLowerCase();
        return serviceCenters.filter(center => 
            center.district?.toLowerCase().includes(query) ||
            center.city?.toLowerCase().includes(query) ||
            center.region?.toLowerCase().includes(query)
        );
    }, [serviceCenters, receiverSearchQuery]);

    const senderDropdownRef = useRef(null);
    const receiverDropdownRef = useRef(null);

    // Keep creator email synced when user changes
    useEffect(() => {
        if (user?.email) {
            setValue('creatorEmail', user.email);
        }
    }, [user, setValue]);

    const getWarehouseDisplayName = (center) => {
        if (!center || !center.district) return '';
        return `${center.district}, ${center.city} (${center.region})`;
    };

    // Generate unique tracking ID
    const generateTrackingID = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TRK-${timestamp}-${randomStr}`;
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (senderDropdownRef.current && !senderDropdownRef.current.contains(event.target)) {
                setSenderDropdownOpen(false);
            }
            if (receiverDropdownRef.current && !receiverDropdownRef.current.contains(event.target)) {
                setReceiverDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Calculate pricing based on parcel type, weight, and delivery location
    const calculatePrice = (parcelType, weight, senderWarehouse, receiverWarehouse) => {
        const weightNum = parseFloat(weight) || 0;
        
        // Get sender and receiver warehouse details
        const senderCenter = serviceCenters.find(c => `${c.district}-${c.city}` === senderWarehouse);
        const receiverCenter = serviceCenters.find(c => `${c.district}-${c.city}` === receiverWarehouse);
        
        // Check if within same city
        const isWithinCity = senderCenter && receiverCenter && 
                            senderCenter.city?.toLowerCase() === receiverCenter.city?.toLowerCase();
        
        let price = 0;
        let breakdown = [];
        
        if (parcelType === 'document') {
            // Document: Any weight - ৳60 within city, ৳80 outside
            price = isWithinCity ? 60 : 80;
            breakdown.push(`Base price (Document): ৳${price}`);
        } else {
            // Non-Document (parcelType === 'not-document')
            if (weightNum <= 3) {
                // Up to 3kg: ৳110 within city, ৳150 outside
                price = isWithinCity ? 110 : 150;
                breakdown.push(`Base price (Non-Document, ${weightNum}kg): ৳${price}`);
            } else {
                // Over 3kg: Base + ৳40/kg for additional weight
                const basePrice = isWithinCity ? 110 : 150;
                const additionalWeight = weightNum - 3;
                const additionalCharge = additionalWeight * 40;
                
                if (isWithinCity) {
                    price = basePrice + additionalCharge;
                    breakdown.push(`Base price (Non-Document, up to 3kg): ৳${basePrice}`);
                    breakdown.push(`Additional weight (${additionalWeight.toFixed(2)}kg × ৳40): ৳${additionalCharge}`);
                } else {
                    // Outside city: +৳40 extra
                    const extraCharge = 40;
                    price = basePrice + additionalCharge + extraCharge;
                    breakdown.push(`Base price (Non-Document, up to 3kg): ৳${basePrice}`);
                    breakdown.push(`Additional weight (${additionalWeight.toFixed(2)}kg × ৳40): ৳${additionalCharge}`);
                    breakdown.push(`Outside city extra charge: ৳${extraCharge}`);
                }
            }
        }
        
        return {
            price,
            breakdown,
            isWithinCity,
            location: isWithinCity ? 'Within City' : 'Outside City/District'
        };
    };

    const onSubmit = (data) => {
        const { parcelType, parcelWeight, senderWarehouse, receiverWarehouse } = data;
        const creatorEmail = user?.email || data.creatorEmail || 'anonymous';
        const createdAtDate = new Date();
        const createdAtIso = createdAtDate.toISOString();
        const createdAtDisplay = createdAtDate.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        if (!senderWarehouse || !receiverWarehouse) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please select both sender and receiver warehouses.',
            });
            return;
        }
        
        // Get warehouse details for display
        const senderCenter = serviceCenters.find(c => `${c.district}-${c.city}` === senderWarehouse);
        const receiverCenter = serviceCenters.find(c => `${c.district}-${c.city}` === receiverWarehouse);
        
        const calculation = calculatePrice(parcelType, parcelWeight, senderWarehouse, receiverWarehouse);
        
        const breakdownText = calculation.breakdown.join('\n');
        const totalText = `Total: ৳${calculation.price}`;
        
        // Generate unique tracking ID
        const trackingID = generateTrackingID();
        
        const payload = {
            ...data,
            trackingID,
            creatorEmail,
            createdAt: createdAtIso,
            price: calculation.price,
            priceBreakdown: calculation.breakdown,
            deliveryLocation: calculation.location
        };

        Swal.fire({
            icon: 'info',
            title: 'Pricing Calculation',
            html: `
                <div style="text-align: left; font-size: 14px;">
                    <p style="margin-bottom: 10px;"><strong>Parcel Details:</strong></p>
                    <p style="margin-bottom: 5px;">Type: ${parcelType === 'document' ? 'Document' : 'Non-Document'}</p>
                    <p style="margin-bottom: 5px;">Weight: ${parcelWeight} kg</p>
                    <p style="margin-bottom: 5px;">Sender: ${senderCenter ? `${senderCenter.district}, ${senderCenter.city}` : 'N/A'}</p>
                    <p style="margin-bottom: 5px;">Receiver: ${receiverCenter ? `${receiverCenter.district}, ${receiverCenter.city}` : 'N/A'}</p>
                    <p style="margin-bottom: 5px;">Delivery: ${calculation.location}</p>
                    <p style="margin-bottom: 5px;"><strong>Tracking ID:</strong> ${trackingID}</p>
                    <p style="margin-bottom: 15px;">Created By: ${creatorEmail}</p>
                    <p style="margin-bottom: 15px;">Created At: ${createdAtDisplay}</p>
                    <p style="margin-bottom: 10px;"><strong>Price Breakdown:</strong></p>
                    <div style="margin-bottom: 10px; white-space: pre-line; line-height: 1.6;">${breakdownText}</div>
                    <p style="margin-top: 15px; font-size: 18px; font-weight: bold; color: #03373D; border-top: 2px solid #e5e7eb; padding-top: 10px;">
                        ${totalText}
                    </p>
                </div>
            `,
            confirmButtonText: 'Confirm Booking',
            confirmButtonColor: '#C8E564',
            width: '500px',
        }).then((result) => {
            if (result.isConfirmed) {
                // Save to backend API first
                axiosSecure.post('/parcels', payload)
                    .then(res => {
                        // Get the inserted ID from MongoDB response
                        const insertedId = res.data?.insertedId || res.data?._id || res.data?.id;
                        
                        // Log the full response and inserted ID
                        console.log('Backend Response:', res.data);
                        console.log('Inserted ID:', insertedId);
                        
                        // Update payload with database ID if available
                        const finalPayload = insertedId ? { ...payload, _id: insertedId } : payload;
                        
                        // Add parcel to the array with database ID
                        const updatedParcels = [...parcels, finalPayload];
                        setParcels(updatedParcels);
                        
                        // Save to localStorage with database ID
                        localStorage.setItem('parcels', JSON.stringify(updatedParcels));
                        
                        // Log to console
                        console.log('All Parcels:', updatedParcels);
                        console.log('New Parcel Added:', finalPayload);
                        
                        // Show success message with tracking ID and database ID
                        Swal.fire({
                            icon: 'success',
                            title: 'Parcel Saved!',
                            html: `
                                <p>Your parcel has been saved successfully to the database.</p>
                                <p style="margin-top: 10px;"><strong>Tracking ID:</strong> ${payload.trackingID}</p>
                                ${insertedId ? `<p style="margin-top: 10px;"><strong>Database ID:</strong> ${insertedId}</p>` : ''}
                            `,
                            confirmButtonColor: '#C8E564',
                        });
                    })
                    .catch(error => {
                        // Backend save failed - save to localStorage as backup
                        console.error('Error saving to backend:', error);
                        console.error('Error details:', {
                            message: error.message,
                            code: error.code,
                            response: error.response?.data,
                            status: error.response?.status,
                            config: {
                                url: error.config?.url,
                                baseURL: error.config?.baseURL,
                                method: error.config?.method
                            }
                        });
                        console.log('Saving to localStorage as backup...');
                        
                        // Add parcel to the array
                        const updatedParcels = [...parcels, payload];
                        setParcels(updatedParcels);
                        
                        // Save to localStorage
                        localStorage.setItem('parcels', JSON.stringify(updatedParcels));
                        
                        // Log to console
                        console.log('All Parcels (local only):', updatedParcels);
                        console.log('New Parcel Added (local only):', payload);
                        
                        // Show warning message with error details
                        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
                        Swal.fire({
                            icon: 'warning',
                            title: 'Saved Locally',
                            html: `
                                <p>Parcel saved to local storage only.</p>
                                <p style="margin-top: 10px;"><strong>Tracking ID:</strong> ${payload.trackingID}</p>
                                <p style="margin-top: 10px; font-size: 12px; color: #666;">Error: ${errorMessage}</p>
                                <p style="margin-top: 5px; font-size: 11px; color: #999;">Check console for details.</p>
                            `,
                            confirmButtonColor: '#C8E564',
                        });
                    });
            }
        });
    };

    return (
        <div className="min-h-[50vh] flex items-center justify-center p-4 sm:p-6 bg-base-200">
            <div className="w-full max-w-7xl">
                <div className="bg-base-200 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content mb-2">Add Parcel</h1>
                        <p className="text-base sm:text-lg text-base-content">Enter your parcel details</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg shadow-lg p-4 sm:p-6 md:p-8 bg-base-100">
                    {/* Hidden meta fields */}
                    <input type="hidden" {...register('creatorEmail')} />
                    <input type="hidden" {...register('createdAt')} />
                    {/* Parcel Type Selection */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="document"
                                    {...register('parcelType', { required: true })}
                                    className="radio radio-success"
                                />
                                <span className="text-base-content">Document</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="not-document"
                                    {...register('parcelType', { required: true })}
                                    className="radio radio-success"
                                />
                                <span className="text-base-content">Not-Document</span>
                            </label>
                        </div>
                    </div>

                    {/* Parcel Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-base-content mb-2">
                                Parcel Name
                            </label>
                            <input
                                type="text"
                                {...register('parcelName', { required: 'Parcel name is required' })}
                                placeholder="Parcel Name"
                                className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                            />
                            {errors.parcelName && (
                                <span className="text-red-500 text-sm">{errors.parcelName.message}</span>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-base-content mb-2">
                                Parcel Weight (KG)
                            </label>
                            <input
                                type="text"
                                {...register('parcelWeight', { required: 'Parcel weight is required' })}
                                placeholder="Parcel Weight"
                                className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                            />
                            {errors.parcelWeight && (
                                <span className="text-red-500 text-sm">{errors.parcelWeight.message}</span>
                            )}
                        </div>
                    </div>

                    {/* Sender and Receiver Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                        {/* Sender Details */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-4 sm:mb-6">Sender Details</h2>
                            
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Sender Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('senderName', { required: 'Sender name is required' })}
                                            placeholder="Sender Name"
                                            className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        />
                                        {errors.senderName && (
                                            <span className="text-red-500 text-sm">{errors.senderName.message}</span>
                                        )}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Pickup Warehouse
                                        </label>
                                        <Controller
                                            name="senderWarehouse"
                                            control={control}
                                            rules={{ required: 'Please select a warehouse' }}
                                            render={({ field }) => {
                                                const selectedLabel = field.value
                                                    ? (() => {
                                                        const center = serviceCenters.find(c => `${c.district}-${c.city}` === field.value);
                                                        return center ? getWarehouseDisplayName(center) : field.value;
                                                    })()
                                                    : '';
                                                const inputValue = senderDropdownOpen
                                                    ? senderSearchQuery
                                                    : senderSearchQuery || selectedLabel;
                                                return (
                                                    <div className="relative w-full" ref={senderDropdownRef}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search warehouse"
                                                            value={inputValue}
                                                            autoComplete="off"
                                                            onChange={(e) => {
                                                                setSenderSearchQuery(e.target.value);
                                                                setSenderDropdownOpen(true);
                                                            }}
                                                            onFocus={() => setSenderDropdownOpen(true)}
                                                            className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                                        />
                                                        {senderDropdownOpen && senderSearchQuery.trim() && (
                                                            <div className="absolute bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 z-[1000] max-w-full" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                <ul className="menu p-0 m-0">
                                                                    {filteredSenderWarehouses.length > 0 ? (
                                                                        filteredSenderWarehouses.map((center, index) => (
                                                                            <li key={index} className="border-b border-gray-100 last:border-b-0">
                                                                                <a
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        const warehouseId = `${center.district}-${center.city}`;
                                                                                        field.onChange(warehouseId);
                                                                                        setSenderSearchQuery(getWarehouseDisplayName(center));
                                                                                        setSenderDropdownOpen(false);
                                                                                    }}
                                                                                    className="text-black hover:bg-gray-100 py-2 px-4 cursor-pointer"
                                                                                >
                                                                                    {getWarehouseDisplayName(center)}
                                                                                </a>
                                                                            </li>
                                                                        ))
                                                                    ) : (
                                                                        <li className="p-4 text-base-content/70 text-center">No warehouse found</li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />
                                        {errors.senderWarehouse && (
                                            <span className="text-red-500 text-sm">{errors.senderWarehouse.message}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            {...register('senderAddress', { required: 'Address is required' })}
                                            placeholder="Address"
                                        className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        />
                                        {errors.senderAddress && (
                                            <span className="text-red-500 text-sm">{errors.senderAddress.message}</span>
                                        )}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Sender Contact No
                                        </label>
                                        <input
                                            type="tel"
                                            {...register('senderContact', { required: 'Contact number is required' })}
                                            placeholder="Sender Contact No"
                                            className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        />
                                        {errors.senderContact && (
                                            <span className="text-red-500 text-sm">{errors.senderContact.message}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Your Region
                                    </label>
                                    <select
                                        {...register('senderRegion', { required: 'Please select your region' })}
                                        className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400"
                                    >
                                        
                                        <option value="" disabled selected>Select your region</option>
                                        {uniqueRegions.map(region => (
                                            <option key={region} value={region.toLowerCase()}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.senderRegion && (
                                        <span className="text-red-500 text-sm">{errors.senderRegion.message}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Pickup Instruction
                                    </label>
                                    <textarea
                                        {...register('pickupInstruction')}
                                        placeholder="Pickup Instruction"
                                        className="textarea textarea-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        rows="3"
                                    />
                                    <p className="text-sm text-base-content/70 mt-2">* PickUp Time 4pm-7pm Approx.</p>
                                </div>
                            </div>
                        </div>

                        {/* Receiver Details */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-4 sm:mb-6">Receiver Details</h2>
                            
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Receiver Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('receiverName', { required: 'Receiver name is required' })}
                                            placeholder="Receiver Name"
                                            className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        />
                                        {errors.receiverName && (
                                            <span className="text-red-500 text-sm">{errors.receiverName.message}</span>
                                        )}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Delivery Warehouse
                                        </label>
                                        <Controller
                                            name="receiverWarehouse"
                                            control={control}
                                            rules={{ required: 'Please select a warehouse' }}
                                            render={({ field }) => {
                                                const selectedLabel = field.value
                                                    ? (() => {
                                                        const center = serviceCenters.find(c => `${c.district}-${c.city}` === field.value);
                                                        return center ? getWarehouseDisplayName(center) : field.value;
                                                    })()
                                                    : '';
                                                const inputValue = receiverDropdownOpen
                                                    ? receiverSearchQuery
                                                    : receiverSearchQuery || selectedLabel;
                                                return (
                                                    <div className="relative w-full" ref={receiverDropdownRef}>
                                                        <input
                                                            type="text"
                                                            placeholder="Type to search warehouse..."
                                                            value={inputValue}
                                                            autoComplete="off"
                                                            onChange={(e) => {
                                                                setReceiverSearchQuery(e.target.value);
                                                                setReceiverDropdownOpen(true);
                                                            }}
                                                            onFocus={() => setReceiverDropdownOpen(true)}
                                                            className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                                        />
                                                        {receiverDropdownOpen && receiverSearchQuery.trim() && (
                                                            <div className="absolute bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 z-[1000] max-w-full" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                <ul className="menu p-0 m-0">
                                                                    {filteredReceiverWarehouses.length > 0 ? (
                                                                        filteredReceiverWarehouses.map((center, index) => (
                                                                            <li key={index} className="border-b border-gray-100 last:border-b-0">
                                                                                <a
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        const warehouseId = `${center.district}-${center.city}`;
                                                                                        field.onChange(warehouseId);
                                                                                        setReceiverSearchQuery(getWarehouseDisplayName(center));
                                                                                        setReceiverDropdownOpen(false);
                                                                                    }}
                                                                                    className="text-black hover:bg-gray-100 py-2 px-4 cursor-pointer"
                                                                                >
                                                                                    {getWarehouseDisplayName(center)}
                                                                                </a>
                                                                            </li>
                                                                        ))
                                                                    ) : (
                                                                        <li className="p-4 text-base-content/70 text-center">No warehouse found</li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />
                                        {errors.receiverWarehouse && (
                                            <span className="text-red-500 text-sm">{errors.receiverWarehouse.message}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Receiver Address
                                        </label>
                                        <input
                                            type="text"
                                            {...register('receiverAddress', { required: 'Address is required' })}
                                            placeholder="Address"
                                        className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        />
                                        {errors.receiverAddress && (
                                            <span className="text-red-500 text-sm">{errors.receiverAddress.message}</span>
                                        )}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Receiver Contact No
                                        </label>
                                        <input
                                            type="tel"
                                            {...register('receiverContact', { required: 'Contact number is required' })}
                                            placeholder="Receiver Contact No"
                                        className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        />
                                        {errors.receiverContact && (
                                            <span className="text-red-500 text-sm">{errors.receiverContact.message}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Receiver Region
                                    </label>
                                    <select
                                        {...register('receiverRegion', { required: 'Please select receiver region' })}
                                        className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400"
                                    >
                                        <option value="" disabled selected>Select your region</option>
                                        {uniqueRegions.map(region => (
                                            <option key={region} value={region.toLowerCase()}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.receiverRegion && (
                                        <span className="text-red-500 text-sm">{errors.receiverRegion.message}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Delivery Instruction
                                    </label>
                                    <textarea
                                        {...register('deliveryInstruction')}
                                        placeholder="Delivery Instruction"
                                        className="textarea textarea-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-400"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-6 sm:mt-8">
                        <button
                            type="submit"
                            className="btn bg-[#C8E564] text-[#03373D] hover:bg-[#b8d554] font-semibold px-6 sm:px-12 py-2 sm:py-3 rounded-lg w-full sm:w-auto text-sm sm:text-base"
                        >
                            Proceed to Confirm Booking
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};

export default SendParcel;