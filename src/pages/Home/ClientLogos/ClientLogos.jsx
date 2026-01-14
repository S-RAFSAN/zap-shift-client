import React from 'react';
import Marquee from 'react-fast-marquee';
import amazon from '../../../assets/brands/amazon.png';
import amazonVector from '../../../assets/brands/amazon_vector.png';
import casio from '../../../assets/brands/casio.png';
import moonstar from '../../../assets/brands/moonstar.png';
import randstad from '../../../assets/brands/randstad.png';
import start from '../../../assets/brands/start.png';
import startPeople from '../../../assets/brands/start-people 1.png';

const ClientLogos = () => {
    const logos = [
        { src: amazon, alt: 'Amazon' },
        { src: amazonVector, alt: 'Amazon Vector' },
        { src: casio, alt: 'Casio' },
        { src: moonstar, alt: 'Moonstar' },
        { src: randstad, alt: 'Randstad' },
        { src: start, alt: 'Start' },
        { src: startPeople, alt: 'Start People' }
    ];

    return (
        <div className="w-full py-6 bg-[#E8FFCB] ">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 mb-8">We've Helped Thousands Of Sales Teams</h2>
            <Marquee 
                speed={50}
                gradient={false}
                pauseOnHover={true}
                direction="left"
                className="py-4"
            >
                {logos.map((logo, index) => (
                    <div 
                        key={index} 
                        className="flex items-center justify-center mx-8 min-w-[120px] h-16 mr-20 opacity-70 hover:opacity-100"
                    >
                        <img 
                            src={logo.src} 
                            alt={logo.alt}
                            className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105"
                        />
                    </div>
                ))}
            </Marquee>
        </div>
    );
};

export default ClientLogos;