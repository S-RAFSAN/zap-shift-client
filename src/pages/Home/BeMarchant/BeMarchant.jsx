import React from 'react';
import location from '../../../assets/location-merchant.png';

const BeMarchant = () => {
    return (
        <div className="hero bg-[#03373D] p-20 rounded-4xl">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            src={location}
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">Merchant and Customer Satisfaction is Our First Priority</h1>
            <p className="py-6">
            We offer the lowest delivery charge with the highest value along with 100% safety of your product. Pathao courier delivers your parcels in every corner of Bangladesh right on time.
            </p>
            <button className="btn  bg-[#03373D] rounded-full hover:btn-primary">Became a Merchant</button>
            <button className="btn btn-primary rounded-full ml-4">Earn with Profast Courier</button>
          </div>
        </div>
      </div>
    );
};

export default BeMarchant;