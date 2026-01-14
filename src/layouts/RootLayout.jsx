import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../router/shared/Navbar/Navbar';
import Footer from '../router/shared/Navbar/Footer/Footer';

const RootLayout = () => {
    return (
        <div>
            <Navbar />  
            <Outlet></Outlet> 
            <Footer />
        </div>
    );
};

export default RootLayout;