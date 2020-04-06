import React from 'react';
import { useParams } from 'react-router-dom';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import ChevronLeft from 'baseui/icon/chevron-left';
import {
  Label1,
} from 'baseui/typography';
import {
  useQuery
} from '@apollo/react-hooks';
import {
  AUTHORIZE_EVENT_PAGE,
  GET_EVENT
} from '../constants/query';

import VenueEventDetails from './venue-event-details';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

function EventRouter() {
  const { eventId } = useParams();
  const { data, loading, error } = useQuery(AUTHORIZE_EVENT_PAGE, {
    variables: {
      eventId
    }
  });
  if (loading || error) {
    return <Loading />;
  }

  const {
    authorizeEventPage: auth
  } = data;

  if (auth === 'GUEST') {
    return (
      <Block display="flex" justifyContent="center" />
    );
  }

  if (auth === 'VENUE') {
    return <VenueEventDetails />;
  }

  return (
    <Block display="flex" justifyContent="center">
      <Label1>You don't have access</Label1>
    </Block>
  );
}

const BackButton = () => {
  const { eventId } = useParams();
  const { data, loading, error } = useQuery(AUTHORIZE_EVENT_PAGE, {
    variables: {
      eventId
    }
  });
  const { data: eventData, loading: eventDataLoading, error: eventDataError } = useQuery(GET_EVENT, {
    variables: {
      eventId
    }
  });

  if (loading || error || eventDataLoading || eventDataError) {
    return null;
  }

  const {
    getEvent: {
      venue
    }
  } = eventData;

  const {
    authorizeEventPage: auth
  } = data;
  if (auth === 'VENUE') {
    return (
      <Button kind="secondary" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900'}}}} $as="a" href={`/${venue.symbol}/dashboard`}>
        <ChevronLeft /> Dashboard
      </Button>
    );
  }
};
export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[BackButton]} />
      <EventRouter />
    </Block>
  );
}
