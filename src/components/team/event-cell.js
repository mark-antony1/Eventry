import React, { useState, useEffect } from 'react';
import { useStyletron } from 'styletron-react';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Tag } from 'baseui/tag';
import {
  Display4,
  Label1,
  Label3,
} from 'baseui/typography';

export default function EventCell({ event }) {
  const [ css ] = useStyletron();

  const {
    name
  } = event;
  const timeSet = Boolean(event.time);
  const time = moment(event.time);
  const createdAt = moment(event.createdAt);
  const now = moment();
  const tomorrow = moment().add(1, 'days');
  const { status } = event;

  const isPast = time.isBefore(now);

  const renderStatus = () => {
    if (status === 'CREATED') {
      return <Tag closeable={false} variant="outlined" kind="accent"><b>New</b></Tag>;
    }
    if (status === 'CANCELLED') {
      return <Tag closeable={false} variant="outlined" kind="negative"><b>Cancelled</b></Tag>;
    }
    if (isPast && status !== 'CLOSED') {
      return <Tag closeable={false} variant="outlined" kind="accent"><b>To Be Closed</b></Tag>;
    }
    if (isPast && status === 'CLOSED') {
      return <Tag closeable={false} variant="outlined" kind="positive"><b>Closed</b></Tag>;
    }
    if (status === 'READY') {
      return <Tag closeable={false} variant="outlined" kind="positive"><b>Upcoming...</b></Tag>;
    }
    return null;
  };

  const getBackgroundColor = () => {
    if (status !== 'CANCELLED' && time.isBefore(tomorrow) && time.isAfter(now)) {
      return '#CEEDE8';
    }
    return '#f6f6f6';
  };

  return (
    <Block
      padding="12px"
      marginTop="12px"
      backgroundColor={getBackgroundColor()}
      className={css({
        cursor: 'pointer',
        borderRadius: '15px',
        ':hover': {
          opacity: 0.6
        }
      })}
    >
      <a href={`/event/${event.id}`} rel="noopener noreferrer" target="_blank" className={css({ textDecoration: 'none' })}>
        {
          name ?
          <Label1><b>{name}</b></Label1> : null
        }
        {
          (!timeSet && !name) ?
          <Label1><b>Event!</b></Label1> : null
        }
        {
          timeSet ?
          <Block>
            <Label1><b>{time.calendar()}</b></Label1>
          </Block> : null
        }
        {
          event.groupSize &&
          <Label3><b>{event.groupSize} people</b></Label3>
        }
        <Block marginLeft="-6px">
          {renderStatus()}
        </Block>
        {
          now.diff(createdAt, 'hour') < 12 ?
          <Label3><b>Created {createdAt.fromNow()}</b></Label3> : null
        }
      </a>
    </Block>
  );
}
