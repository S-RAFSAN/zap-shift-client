import React from 'react'
import axios from 'axios'


const useAxiosSecure = () => {
    // Use Vercel backend URL in production, localhost for development
    const apiUrl = import.meta.env.VITE_API_URL || 
        (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://zap-shift-server-taupe-six.vercel.app');
    
    const axiosSecure = axios.create({
        baseURL: apiUrl,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    return axiosSecure
}

export default useAxiosSecure