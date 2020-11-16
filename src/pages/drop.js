import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Tag } from 'baseui/tag';
import QRCode from 'qrcode.react';
import {
  Display4,
  Label1,
  Label3,
} from 'baseui/typography';
import {
  useQuery
} from '@apollo/react-hooks';

import {
  REPLY_TO_INSTAGRAM_MEDIA_COMMENT,
  ARCHIVE_TASK
} from '../constants/mutation';
import {
  LOAD_DROP
} from '../constants/query';

import Loading from '../components/loading';

function Drop() {
  const { drop_id } = useParams();
  const { loading, data, error } = useQuery(LOAD_DROP, {
    variables: {
      drop_id
    }
  });

  if (loading) {
    return <Loading />;
  }

  const {
    drop: {
      id,
      content,
      end_at,
      start_at
    }
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
        <QRCode
          value={`${window.location.origin}/validate-drop/${drop_id}`}
        />
        <Label3 marginTop="12px">{content}</Label3>
        {
          moment().isBefore(moment(start_at)) ?
          <Label3 marginTop="12px">{`Hold on... this starts at ${moment(start_at).format('MMM Do h:mm a')}`}</Label3>:
          <Block display="flex" flexDirection="column" alignItems="center">
            <Label3 marginTop="12px">
              Show this at store now!
            </Label3>
            <Label3 marginTop="12px">{`Valid until ${moment(end_at).format('MMM Do h:mm a')}`}</Label3>
          </Block>
        }
      </Block>
    </Block>
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <Drop />
    </Block>
  );
}
