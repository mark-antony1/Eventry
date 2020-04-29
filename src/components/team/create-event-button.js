import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '../button';

import { GET_USER_BY_AUTH } from '../../constants/query';
import {
  useQuery
} from '@apollo/react-hooks';

export default ({ showModal }) => {
  const history = useHistory();
  const { venueSymbol: symbol } = useParams();
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);

  if (loading) {
    return null;
  }

  const {
    getUserByAuth: auth
  } = data;
  if (!auth) {
    return (
      <Button
        color="#fff"
        backgroundColor="#4284F2"
        kind="secondary"
        onClick={() => {
          history.push(`/user/?from=${symbol}`);
        }}
      >
        <b>Start Team Event</b>
      </Button>
    );
  }
  return (
    <Button
      color="#fff"
      backgroundColor="#4284F2"
      kind="secondary"
      onClick={() => {
        showModal();
      }}
    >
      <b>Start Team Event</b>
    </Button>
  );
};
