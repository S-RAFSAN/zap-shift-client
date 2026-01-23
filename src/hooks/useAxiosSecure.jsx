import React from 'react'
import axios from 'axios'


const useAxiosSecure = () => {
    const axiosSecure = axios.create({
        baseURL: `http://localhost:5000`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    return axiosSecure
}

export default useAxiosSecure