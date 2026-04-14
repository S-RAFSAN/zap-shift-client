import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import agentPending  from "../../../assets/agent-pending.png"          

const BeARaider = () => {
  const serviceCenters = useLoaderData() || [];
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    // reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      applicantEmail: user?.email || "",
      region: "",
      district: "",
      warehouse: "",
      age: "",
      phone: "",
      nidNo: "",
      bikeRegNo: "",
    },
  });

  const selectedRegion = watch("region");
  const selectedDistrict = watch("district");

  // Unique regions from service center data
  const uniqueRegions = useMemo(() => {
    const set = new Set();
    serviceCenters.forEach((center) => {
      if (center?.region) set.add(center.region.trim());
    });
    return Array.from(set).sort();
  }, [serviceCenters]);

  // Districts filtered by selected region
  const districtsForRegion = useMemo(() => {
    if (!selectedRegion?.trim()) return [];
    const set = new Set();
    serviceCenters.forEach((center) => {
      if (center?.region?.trim() === selectedRegion && center?.district) {
        set.add(center.district.trim());
      }
    });
    return Array.from(set).sort();
  }, [serviceCenters, selectedRegion]);

  // Warehouses (service centers) filtered by selected district
  const warehousesForDistrict = useMemo(() => {
    if (!selectedDistrict?.trim()) return [];
    return serviceCenters.filter(
      (center) =>
        center?.district?.trim() === selectedDistrict && center?.region?.trim() === selectedRegion
    );
  }, [serviceCenters, selectedDistrict, selectedRegion]);

  // Sync email from auth
  useEffect(() => {
    if (user?.email) setValue("applicantEmail", user.email);
  }, [user, setValue]);

  // Reset district and warehouse when region changes
  useEffect(() => {
    setValue("district", "");
    setValue("warehouse", "");
  }, [selectedRegion, setValue]);

  // Reset warehouse when district changes
  useEffect(() => {
    setValue("warehouse", "");
  }, [selectedDistrict, setValue]);

  const onSubmit = async (data) => {
    console.log("[BeARider] Form submitted with data:", data);
    try {
      const payload = {
        displayName: data.displayName,
        applicantEmail: data.applicantEmail || user?.email,
        region: data.region,
        district: data.district,
        warehouse: data.warehouse || null,
        phone: data.phone,
        nidNo: data.nidNo,
        bikeRegNo: data.bikeRegNo || null,
        age: data.age || null,
      };
      console.log("[BeARider] Sending payload:", payload);

      const res = await axiosSecure.post("/rider-applications", payload);
      console.log("[BeARider] API response:", res.data);

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Application Submitted!",
          text: "Your rider application has been submitted. We'll review it and get back to you soon.",
          confirmButtonColor: "#C8E564",
        });
        // reset({
        //   displayName: "",
        //   applicantEmail: user?.email || "",
        //   region: "",
        //   district: "",
        //   warehouse: "",
        //   age: "",
        //   phone: "",
        //   nidNo: "",
        //   bikeRegNo: "",
        // });
      }
    } catch (error) {
      console.error("[BeARider] Submission error:", error);
      const msg = error.response?.data?.message || error.message || "Failed to submit";
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: msg,
        confirmButtonColor: "#C8E564",
      });
    }
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4 sm:p-6 bg-base-200">
      <div className="w-full max-w-6xl m-20 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
        {/* Left: Form */}
        <div className="flex-1 w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#C8E564] mb-2">
              Be a Rider
            </h1>
            <p className="text-base text-white">
              Enjoy fast, reliable parcel delivery with real-time tracking and
              zero hassle. From personal packages to business shipments — we
              deliver on time, every time.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-[#03373D] mb-6">
              Tell us about yourself
            </h2>

            <div className="space-y-4">
              {/* Row 1: Name (editable), Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    {...register("displayName", { required: "Name is required" })}
                    placeholder="Your Name"
                    className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.displayName && (
                    <span className="text-red-500 text-sm">
                      {errors.displayName.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Age
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    {...register("age", {
                      pattern: { value: /^\d+$/, message: "Enter digits only" },
                    })}
                    placeholder="Your age"
                    className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.age && (
                    <span className="text-red-500 text-sm">
                      {errors.age.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Email (read-only), Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    {...register("applicantEmail", {
                      required: "Email is required",
                    })}
                    readOnly
                    className="input input-bordered w-full bg-gray-100 cursor-not-allowed border-gray-300 text-gray-700"
                    placeholder="Your Email"
                  />
                  {errors.applicantEmail && (
                    <span className="text-red-500 text-sm">
                      {errors.applicantEmail.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Region
                  </label>
                <select
                  {...register("region", {
                    required: "Please select your region",
                  })}
                  className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400"
                >
                  <option value="" disabled>
                    Select your region
                  </option>
                  {uniqueRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <span className="text-red-500 text-sm">
                    {errors.region.message}
                  </span>
                )}
                </div>
              </div>

              {/* Row 3: NID No, Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NID No
                  </label>
                  <input
                    type="text"
                    {...register("nidNo", {
                      required: "NID number is required",
                    })}
                    placeholder="NID"
                    className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.nidNo && (
                    <span className="text-red-500 text-sm">
                      {errors.nidNo.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    {...register("phone", {
                      required: "Contact number is required",
                      pattern: {
                        value: /^\d+$/,
                        message: "Enter digits only",
                      },
                    })}
                    placeholder="Contact"
                    className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-sm">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 4: District (after region) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your District
                </label>
                <select
                  {...register("district", {
                    required: "Please select your district",
                  })}
                  disabled={!selectedRegion}
                  className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400 disabled:bg-gray-100"
                >
                  <option value="">
                    {selectedRegion
                      ? "Select your district"
                      : "Select region first"}
                  </option>
                  {districtsForRegion.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <span className="text-red-500 text-sm">
                    {errors.district.message}
                  </span>
                )}
              </div>

              {/* Row 5: Warehouse */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Which warehouse you want to work?
                </label>
                <select
                  {...register("warehouse")}
                  disabled={!selectedDistrict}
                  className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400 disabled:bg-gray-100"
                >
                  <option value="">
                    {selectedDistrict
                      ? "Select warehouse"
                      : "Select district first"}
                  </option>
                  {warehousesForDistrict.map((center, index) => {
                    const value = `${center.district}-${center.city}`;
                    const label = `${center.district}, ${center.city} (${center.region})`;
                    return (
                      <option key={index} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Row 6: Bike Reg No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bike Registration No
                </label>
                <input
                  type="text"
                  {...register("bikeRegNo")}
                  placeholder="Bike registration number"
                  className="input input-bordered w-full bg-white text-black border-gray-300 placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn w-full mt-6 bg-[#C8E564] text-[#03373D] hover:bg-[#b8d554] font-semibold py-3 rounded-lg"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Right: Illustration placeholder */}
        <div className="flex-1 hidden lg:flex
          items-center justify-center mt-30">  
          <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-[#C8E564]/20 to-[#03373D]/10 flex items-center justify-center">
            <img
              src={agentPending}
              alt="agent-pending"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeARaider;
