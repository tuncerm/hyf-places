import React, { useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './PlaceForm.css';

const UpdatePlace = () => {
  const auth =  useContext(AuthContext);
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const placeId = useParams().placeId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      }
    },
    false
  );

  useEffect(()=>{
    const fetchPlace = async () => {
      const response = await sendRequest(`${process.env.REACT_APP_API_URL}/places`);
      setFormData(
        {
          title: {
            value: response.place.title,
            isValid: true
          },
          description: {
            value: response.place.description,
            isValid: true
          }
        },
        true
      );
    }
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async event => {
    event.preventDefault();
    try{
      await sendRequest(`${process.env.REACT_APP_API_URL}/places/${placeId}`, 'PATCH', JSON.stringify({
        title: formState.inputs.title.value,
        description: formState.inputs.description.value
      }),{'Content-Type': 'application/json', 'Authorization': 'Bearer ' + auth.token});
      history.push(`/${auth.userId}/places`);
    } catch {}
  };

 

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <div className="center"><LoadingSpinner /></div>}
      {!isLoading && <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
          initialValue={formState.inputs.title.value}
          initialValid={formState.inputs.title.isValid}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (min. 5 characters)."
          onInput={inputHandler}
          initialValue={formState.inputs.description.value}
          initialValid={formState.inputs.description.isValid}
        />
        <Button type="submit" disabled={!formState.isValid}>
          UPDATE PLACE
        </Button>
      </form>}
    </React.Fragment>
  );
};

export default UpdatePlace;
