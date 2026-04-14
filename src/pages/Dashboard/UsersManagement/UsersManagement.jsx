import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { RiShieldCheckFill } from "react-icons/ri";
import { FiShieldOff } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useState } from 'react';

const UsersManagement = () => {

    const axiosSecure = useAxiosSecure();
    const [searchText, setSearchText] = useState('');
    const { data: users = [], refetch} = useQuery({
        queryKey: ['users', searchText],
        queryFn: async () => {
            const res = await axiosSecure.get
            (`/users?searchText=${searchText}`);
            return res.data;
        },
        
        });

        const handleMakeAdmin = (user) => {
          const roleInfo = { role: 'admin' }
            axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
            .then(res => {
                if(res.data.modifiedCount) {
                  refetch();
                    Swal.fire({
                        title: 'Success',
                        text: `${user.displayName} made admin successfully`,
                        icon: 'success'
                    });
                }

            })
            .catch(err => {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to make admin',
                    icon: 'error'
                });
            });
            };


            const handleRemoveAdmin = (user) => {
              const roleInfo = { role: 'user' }
              axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
              .then(res => {
                if(res.data.modifiedCount) {
                  refetch();
                  Swal.fire({
                    title: 'Success',
                    text: `${user.displayName} removed admin successfully`,
                    icon: 'success'
                  });
                }
              })
              .catch(err => {
                Swal.fire({
                  title: 'Error',
                  text: 'Failed to remove admin',
                  icon: 'error'
                });
              });
            };
            

    return (
      <div className="overflow-x-auto">
        <label className="input">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" required placeholder ="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </label>
        <table className="table table-zebra">
          <thead>
            <tr>
              <th></th>
              <th>Admin</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.displayName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="flex gap-1">
                  {user.role === "admin" ? (
                    <button
                      onClick={() => handleRemoveAdmin(user)}
                      className="btn btn-error text-xl"
                    >
                      <FiShieldOff />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMakeAdmin(user)}
                      className="btn btn-success text-xl"
                    >
                      <RiShieldCheckFill />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
};

export default UsersManagement;