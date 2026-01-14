import React from 'react';

const Services = () => {
    const serviceCards = [
        {
            id: 1,
            title: "Express Delivery",
            description: "We deliver parcels within 24-72 hours in Bangladesh. Express delivery available from pick-up to drop-off.",
            icon: "🚀",
            hoverClass: "hover:bg-orange-700"
        },
        {
            id: 2,
            title: "Nationwide Delivery",
            description: "We deliver parcels nationwide with home delivery in every district, ensuring your products reach customers within 48-72 hours.",
            icon: "🌍",
            hoverClass: "hover:bg-green-700"
        },
        {
            id: 3,
            title: "Fulfillment Solution",
            description: "We also offer customized service with inventory management support, online order processing, packaging, and after sales support.",
            icon: "📦",
            hoverClass: "hover:bg-blue-700"
        },
        {
            id: 4,
            title: "Cash on Delivery",
            description: "100% cash on delivery anywhere in Bangladesh with guaranteed safety of your product.",
            icon: "💰",
            hoverClass: "hover:bg-orange-600"
        },
        {
            id: 5,
            title: "Corporate / Contract",
            description: "Customized corporate services which includes warehouse and inventory management support.",
            icon: "🤝",
            hoverClass: "hover:bg-purple-700"
        },
        {
            id: 6,
            title: "Parcel Return",
            description: "Through our reverse logistics facility we allow end customers to return or exchange their products with online business merchants.",
            icon: "↩️",
            hoverClass: "hover:bg-pink-700"
        }
    ];

    return (
        <div className="bg-teal-800 py-16 px-5 min-h-[50vh] flex flex-col items-center rounded-3xl mt-5 mb-8">
            {/* Header Section */}
            <div className="text-center mb-12 max-w-4xl">
                <h1 className="text-4xl font-bold text-white mb-5">
                    Our Services
                </h1>
                <p className="text-lg text-white leading-relaxed">
                    Enjoy fast, reliable parcel delivery with real-time tracking and zero hassle. 
                    From personal packages to business shipments — we deliver on time, every time.
                </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
                {serviceCards.map((service) => (
                    <div
                        key={service.id}
                        className={`bg-white rounded-xl p-8 shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:-translate-y-2 hover:shadow-xl ${service.hoverClass} hover:text-white group`}
                    >
                        {/* Icon */}
                        <div className="text-5xl mb-5 text-center">
                            {service.icon}
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center transition-colors duration-300 group-hover:text-white">
                            {service.title}
                        </h3>

                        {/* Description */}
                        <p className="text-lg text-gray-600 leading-relaxed text-center transition-colors duration-300 group-hover:text-white">
                            {service.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Services;