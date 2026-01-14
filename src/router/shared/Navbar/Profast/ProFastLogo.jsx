import React from 'react';
import logo from '../../../../assets/logo.png';

const ProFastLogo = () => {
    return (
        <div className='flex items-end'>
            <img src={logo} alt="" />
            <p className='text-2xl font-bold -ml-2 font-extrabold'>ProFast</p>
        </div>
    );
};

export default ProFastLogo;