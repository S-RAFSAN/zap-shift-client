import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLoaderData } from 'react-router';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to control map from parent with flyTo animation
function MapController({ center, zoom, shouldAnimate, onAnimationComplete }) {
    const map = useMap();
    useEffect(() => {
        if (center && shouldAnimate) {
            map.flyTo(center, zoom || 10, {
                duration: 2, // Animation duration in seconds
                easeLinearity: 0.25,
                animate: true
            });
            // Reset animation flag after animation completes
            if (onAnimationComplete) {
                const timer = setTimeout(() => {
                    onAnimationComplete();
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [map, center, zoom, shouldAnimate, onAnimationComplete]);
    return null;
}

const Coverage = () => {
    const serviceCentersData = useLoaderData();
    const serviceCenters = serviceCentersData || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [mapCenter, setMapCenter] = useState([23.6850, 90.3563]);
    const [mapZoom, setMapZoom] = useState(7);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSelectedDistrict(null);
            setMapCenter([23.6850, 90.3563]);
            setMapZoom(7);
            setShouldAnimate(true);
            return;
        }

        // Case-insensitive partial search
        const query = searchQuery.toLowerCase().trim();
        const found = serviceCenters.find(center => 
            center.district?.toLowerCase().includes(query)
        );

        if (found) {
            setSelectedDistrict(found);
            setMapCenter([found.latitude, found.longitude]);
            setMapZoom(16);
            setShouldAnimate(true);
        } else {
            setSelectedDistrict(null);
            // Optionally show a message that district not found
        }
    };

    return (
        <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* First Section - Availability */}
                <div className="mb-6 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#C8E564] mb-4 sm:mb-6 text-center sm:text-left px-4 sm:px-0">
                        We are available in 64 districts
                    </h1>
                </div>

                <div className="mb-6 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#C8E564] text-center sm:text-left px-4 sm:px-0">
                        We deliver almost all over Bangladesh
                    </h2>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 overflow-hidden">
                    <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden relative">
                        {/* Search Box Inside Map - Centered */}
                        <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-xl w-[calc(100%-1rem)] sm:w-96 max-w-[calc(100%-1rem)] sm:max-w-none">
                            <form onSubmit={handleSearch} className="flex gap-1 sm:gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none">
                                        <svg 
                                            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search district name"
                                        className="input input-bordered w-full pl-7 sm:pl-9 pr-2 bg-gray-50 text-black text-sm sm:text-base placeholder:text-gray-400 placeholder:opacity-60 focus:outline-none focus:ring-0 focus:border-gray-300"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="btn bg-[#03373D] text-white hover:bg-[#044a52] text-xs sm:text-base px-2 sm:px-4 flex-shrink-0"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        <MapContainer
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <MapController 
                                center={mapCenter} 
                                zoom={mapZoom} 
                                shouldAnimate={shouldAnimate}
                                onAnimationComplete={() => setShouldAnimate(false)}
                            />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {serviceCenters && serviceCenters.map((center) => (
                                <Marker 
                                    key={center.id} 
                                    position={[center.latitude, center.longitude]}
                                    opacity={selectedDistrict && selectedDistrict.id === center.id ? 1 : 0.7}
                                >
                                    <Popup>
                                        <strong>{center.district}
                                        </strong> <br />
                                        {center.covered_area?.join(', ') || 'No covered area'}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Coverage;