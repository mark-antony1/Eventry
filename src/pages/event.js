import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Block } from 'baseui/block';
import PillButton from '../components/pill-button';
import ChevronLeft from 'baseui/icon/chevron-left';
import {
  Label1,
} from 'baseui/typography';
import {
  useQuery
} from '@apollo/react-hooks';
import {
  AUTHORIZE_EVENT_PAGE,
  GET_USER_BY_AUTH,
  GET_EVENT
} from '../constants/query';

import VenueEventDetails from './venue-event-details';
import GuestEventDetails from './guest-event-details';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

function EventRouter() {
  const { eventId } = useParams();
  const { data, loading, error } = useQuery(AUTHORIZE_EVENT_PAGE, {
    variables: {
      eventId
    }
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Block display="flex" justifyContent="center">
        <Label1>You don't have access</Label1>
      </Block>
    );
  };

  const {
    authorizeEventPage: auth
  } = data;

  if (auth === 'GUEST') {
    return <GuestEventDetails />;
  }

  if (auth === 'VENUE') {
    return <VenueEventDetails />;
  }

  return null;
}

const BackButton = () => {
  const { eventId } = useParams();
  const history = useHistory();
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
  const { data: userData, loading: userDataLoading } = useQuery(GET_USER_BY_AUTH);

  useEffect(() => {
    if (userData && !userData.getUserByAuth) {
      history.push(`/user?p=signup&from=event/${eventId}`);
    }
  }, [userData]);
  if (loading || error || eventDataLoading || eventDataError || userDataLoading) {
    return null;
  }

  const {
    getEvent: {
      venue,
      teams: eventTeams
    }
  } = eventData;

  const {
    authorizeEventPage: auth
  } = data;

  const {
    getUserByAuth: {
      user: {
        teams
      }
    }
  } = userData;

  const team = teams.find((team) => {
    return eventTeams.find(et => team.id === et.id);
  }) || {};

  if (auth === 'VENUE') {
    return (
      <PillButton kind="secondary" $as="a" href={`/${venue.symbol}/dashboard`}>
        <ChevronLeft /> Dashboard
      </PillButton>
    );
  }

  if (auth === 'GUEST') {
    return (
      <PillButton kind="secondary" $as="a" href={`/team/${team.id}`}>
        <ChevronLeft /> {team.name}
      </PillButton>
    );
  }

  return null;
};

export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[BackButton]} />
      <EventRouter />
    </Block>
  );
}
