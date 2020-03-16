import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';

const UserPlaces = () => {
  const [places, setPlaces] = useState([]);
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const userId = useParams().userId;

  useEffect(()=>{
    const fetchPlaces = async () => {
      try{
        const response = await sendRequest(`${process.env.REACT_APP_API_URL}/places/user/${userId}`);
        setPlaces(response.places);
      } catch {}
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeletedHandler = (pid) => {
    setPlaces(prev => prev.filter(place => place.id !== pid));
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner />}
      {!isLoading && places && <PlaceList items={places} onDeletePlace={placeDeletedHandler}/>}
    </React.Fragment>
  );
};

export default UserPlaces;
