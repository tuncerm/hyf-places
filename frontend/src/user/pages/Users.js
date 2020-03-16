import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const [users, setUsers] = useState([]);
  

  useEffect(()=>{
    const fetchUsers = async () => {
      try {
        const response = await sendRequest(`${process.env.REACT_APP_API_URL}/users`);
        setUsers(response.users);
      } catch (e) {
        console.log(e);
      }
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}/>
      {isLoading && <div className="center"><LoadingSpinner /></div>}
      <UsersList items={users} />
    </React.Fragment>
  )
  
};

export default Users;
