import React, { useState } from 'react';

const AboutUs = () => {
    const [activeTab, setActiveTab] = useState('Story');

    const tabs = ['Story', 'Mission', 'Success', 'Team & Others'];

    const content = {
        Story: [
            "We started with a simple promise — to make parcel delivery fast, reliable, and stress-free. Over the years, our commitment to real-time tracking, efficient logistics, and customer-first service has made us a trusted partner for thousands. Whether it's a personal gift or a time-sensitive business delivery, we ensure it reaches its destination — on time, every time.",
            "We started with a simple promise — to make parcel delivery fast, reliable, and stress-free. Over the years, our commitment to real-time tracking, efficient logistics, and customer-first service has made us a trusted partner for thousands. Whether it's a personal gift or a time-sensitive business delivery, we ensure it reaches its destination — on time, every time.",
            "We started with a simple promise — to make parcel delivery fast, reliable, and stress-free. Over the years, our commitment to real-time tracking, efficient logistics, and customer-first service has made us a trusted partner for thousands. Whether it's a personal gift or a time-sensitive business delivery, we ensure it reaches its destination — on time, every time."
        ],
        Mission: [
            "Our mission is to revolutionize parcel delivery by providing seamless, transparent, and efficient logistics solutions. We strive to connect people and businesses across Bangladesh with reliable, fast, and affordable delivery services that exceed expectations.",
            "We are committed to leveraging cutting-edge technology, maintaining the highest standards of service quality, and building lasting relationships with our customers through trust, reliability, and innovation."
        ],
        Success: [
            "Over the years, we've successfully delivered millions of parcels across Bangladesh, earning the trust of thousands of satisfied customers. Our success is measured not just in numbers, but in the smiles of customers who receive their packages on time.",
            "We've expanded our network to cover every district, built a robust infrastructure, and developed innovative tracking systems that keep our customers informed every step of the way. Our commitment to excellence has made us a leader in the logistics industry."
        ],
        'Team & Others': [
            "Our team consists of dedicated professionals who are passionate about delivering excellence. From our customer service representatives to our delivery partners, every member of our team is committed to ensuring your parcels reach their destination safely and on time.",
            "We believe in continuous improvement, investing in our team's growth, and maintaining the highest standards of professionalism. Together, we work towards making parcel delivery a seamless experience for everyone."
        ]
    };

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-bold text-[#03373D] mb-4">
                    About Us
                </h1>

                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                    Enjoy fast, reliable parcel delivery with real-time tracking and zero hassle. From personal packages to business shipments — we deliver on time, every time.
                </p>

                <div className="mb-6">
                    <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-gray-300 pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-lg font-semibold pb-2 transition-colors ${
                                    activeTab === tab
                                        ? 'text-[#03373D] border-b-2 border-[#03373D]'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    {content[activeTab]?.map((paragraph, index) => (
                        <p
                            key={index}
                            className="text-gray-500 text-base leading-relaxed mb-6"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;