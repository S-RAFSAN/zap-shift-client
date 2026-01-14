import React from 'react';
import Banner from '../Banner/Banner';
import Services from '../Services/services';
import ClientLogos from '../ClientLogos/ClientLogos';
import Benefits from '../Benefits/Benefits';
import BeMarchant from '../BeMarchant/BeMarchant';

const Home = () => {
    return (
        <div>
           <Banner />
           <Services />
           <ClientLogos />
           <Benefits />
           <BeMarchant />
        </div>
    );
};

export default Home;