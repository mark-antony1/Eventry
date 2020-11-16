import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Tag } from 'baseui/tag';
import { FaCheck, FaTimes } from 'react-icons/fa';
import {
  Display4,
  Label1,
  Label3,
} from 'baseui/typography';
import {
  useMutation
} from '@apollo/react-hooks';

import {
  VALIDATE_DROP
} from '../constants/mutation';
import {
  LOAD_DROP
} from '../constants/query';

import Loading from '../components/loading';

function ValidateDrop() {
  const { drop_id } = useParams();
  const [ validateDrop, { loading, data } ] = useMutation(VALIDATE_DROP);

  useEffect(() => {
    validateDrop({
      variables: {
        drop_id
      }
    });
  }, []);

  if (loading || !data) {
    return <Loading />;
  }

  const {
    validateDrop: validation
  } = data;

  return (
    <Block
      height="100vh"
      width="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Block display="flex" flexDirection="column" alignItems="center">
        {
          validation ?
          <Block display="flex" flexDirection="column" alignItems="center">
            <FaCheck size={50} color="#11bd1c" />
            <Label3>Valid code</Label3>
          </Block> :
          <Block display="flex" flexDirection="column" alignItems="center">
            <FaTimes size={50} color="#d12f1d" />
            <Label3>Invalid code, please double check the event time</Label3>
          </Block>
        }
      </Block>
    </Block>
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <ValidateDrop />
    </Block>
  );
}
