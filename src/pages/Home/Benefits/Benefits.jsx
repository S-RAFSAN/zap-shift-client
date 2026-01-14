import React from 'react';
import trackingImg from '../../../assets/live-tracking.png';
import deliveryImg from '../../../assets/safe-delivery.png';
import serviceImg from '../../../assets/24-7.png';

const Benefits = () => {
    const benefits = [
        {
            title: "Live Parcel Tracking",
            description: "Stay updated in real-time with our live parcel tracking feature. From pick-up to delivery, monitor your shipment's journey and get instant status updates for complete peace of mind.",
            image: trackingImg
        },
        {
            title: "100% Safe Delivery",
            description: "We ensure your parcels are handled with the utmost care and delivered securely to their destination. Our reliable process guarantees safe and damage-free delivery every time.",
            image: deliveryImg
        },
        {
            title: "24/7 Call Center Support",
            description: "Our dedicated support team is available around the clock to assist you with any questions, updates, or delivery concerns—anytime you need us.",
            image: serviceImg
        }
    ];

    return (
        <div className="w-full bg-gray-100 py-16 mt-10 mb-10">
            {/* Top dashed line */}
            <div className="max-w-6xl mx-auto border-t-2 border-dashed border-teal-600 mb-8"></div>
            
            <div className="max-w-6xl mx-auto px-4">
                <div className="space-y-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg p-8 flex items-center">
                            {/* Left section - Image */}
                            <div className="w-1/6 pr-8">
                                <div className="w-full h-32 flex items-center justify-center">
                                    <img 
                                        src={benefit.image} 
                                        alt={benefit.title}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>
                            
                            {/* Vertical dashed line */}
                            <div className="w-px h-32 border-l-2 border-dashed border-teal-600 mx-8"></div>
                            
                            {/* Right section - Text content */}
                            <div className="w-2/3 pl-8">
                                <h3 className="text-2xl font-bold text-teal-600 mb-4 font-urbanist">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-urbanist">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Bottom dashed line */}
            <div className=" max-w-6xl mx-auto border-t-2 border-dashed border-teal-600 mt-8"></div>
        </div>
    );
};

export default Benefits;