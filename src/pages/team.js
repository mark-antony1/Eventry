import React, { useState } from 'react';
import { useParams, useHistory, Switch, Route } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs';
import { Navigation } from 'baseui/side-navigation';
import { Tag } from 'baseui/tag';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Display4,
  Label1,
  Label3,
} from 'baseui/typography';
import {
  useQuery
} from '@apollo/react-hooks';

import {
  GET_UPCOMING_EVENTS_BY_TEAM,
  GET_PAST_EVENTS_BY_TEAM,
  GET_USER_BY_AUTH
} from '../constants/query';

import { getErrorCode } from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

import Members from '../components/team/members';

function EventCell({ event }) {
  const [ css ] = useStyletron();
  const time = moment(event.time);
  const createdAt = moment(event.createdAt);
  const now = moment();
  const tomorrow = moment().add(1, 'days');
  const { status } = event;

  const isPast = time.isBefore(now);

  const renderStatus = () => {
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
        ':hover': {
          opacity: 0.6
        }
      })}
    >
      <a href={`/event/${event.id}`} rel="noopener noreferrer" target="_blank" className={css({ textDecoration: 'none' })}>
        <Label1><b>{time.calendar()}</b></Label1>
        <Label3><b>{time.format('h:mm A')} {time.fromNow()}</b></Label3>
        <Label3><b>{event.groupSize} people</b></Label3>
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

function UpcomingEvents() {
  const { teamId } = useParams();
  const { data, loading, error } = useQuery(GET_UPCOMING_EVENTS_BY_TEAM, {
    variables: {
      teamId
    }
  });

  if (loading || error) {
    return <Loading />
  }

  const {
    getUpcomingEventsByTeam: events
  } = data;

  return (
    <Block padding="8px">
      <Display4><b>Upcoming</b></Display4>
      {!events.length && <Label1><b>No upcoming events</b></Label1>}
      {events.sort((a, b) => moment(a.time).isBefore(b.time) ? -1 : 1).map((event, index) => <EventCell event={event} key={index} />)}
    </Block>
  );
}

const EVENTS_PER_PAGE = 5;
function PastEvents() {
  const { teamId } = useParams();
  const [ page, setPage ] = useState(0);
  const { data, loading, error } = useQuery(GET_PAST_EVENTS_BY_TEAM, {
    variables: {
      teamId,
      skip: page * EVENTS_PER_PAGE
    }
  });

  if (loading || error) {
    return <Loading />;
  }

  const {
    getPastEventsByTeam: events
  } = data;

  const handlePrevPage = () => {
    setPage(page - 1);
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  return (
    <Block padding="8px">
      <Display4><b>Past</b></Display4>
      {!events.length && <Label1><b>No past events</b></Label1>}
      {events.sort((a, b) => moment(a.time).isBefore(b.time) ? -1 : 1).map((event, index) => <EventCell event={event} key={index} />)}
      <Block display="flex" width="100%" marginTop="12px">
        <Block flex="1" display="flex" flexDirection="column">
          <Button kind="minimal" onClick={handlePrevPage} disabled={page === 0}>
            <ChevronLeft size={36} />
          </Button>
        </Block>
        <Block flex="1" display="flex" flexDirection="column">
          <Button kind="minimal" onClick={handleNextPage} disabled={EVENTS_PER_PAGE !== events.length}>
            <ChevronRight size={36} />
          </Button>
        </Block>
      </Block>
    </Block>
  );
}

function Home() {
  return (
    <Block display="flex" flexDirection={['column', 'column', 'row', 'row']}>
      <Block flex="1">
        <UpcomingEvents />
      </Block>
      <Block flex="1">
        <PastEvents />
      </Block>
    </Block>
  );
}

const TABS = [
  'home',
  'members'
];

function TeamDashboardRouter() {
  const { teamId, tab } = useParams();
  const history = useHistory();

  return (
    <Block marginTop="12px" display="flex" flexDirection={['column', 'column', 'row', 'row']}>
      <Block flex="1">
        <Navigation
          items={[
            {
              title: "Home",
              itemId: "home"
            },
            {
              title: "Members",
              itemId: "members"
            }
          ]}
          activeItemId={TABS.indexOf(tab) === -1 ? 'home' : tab}
          onChange={({ event, item }) => {
            event.preventDefault();
            history.push(`/team/${teamId}/${item.itemId}`);
          }}
        />
      </Block>
      <Block flex="4" paddingLeft="24px">
        {
          (!tab || tab === 'home') && <Home />
        }
        {
          tab === 'members' && <Members />
        }
      </Block>
    </Block>
  );
}

function TeamInfo() {
  const { teamId } = useParams();
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);

  if (loading || error) {
    return <Loading />;
  }

  const {
    getUserByAuth: {
      user
    }
  } = data;

  if (!user) {
    return null;
  }

  const {
    teams,
    company
  } = user;

  const team = teams.find(t => t.id === teamId) || {};
  return (
    <Block>
      <Display4><b>{team.name}</b></Display4>
      <Block display="flex">
        {company.logo && <Block marginRight="12px"><img alt="review-logo" height="24px" src={company.logo} /></Block>}
        <Label1><b>{company.name}</b></Label1>
      </Block>
    </Block>
  );
}

function TeamDashboard() {
  const { teamId } = useParams();
  const { loading, error } = useQuery(GET_UPCOMING_EVENTS_BY_TEAM, {
    variables: {
      teamId
    }
  });
  if (loading) {
    return <Loading />;
  }

  if (error && (getErrorCode(error) === 'NOT_AUTHORIZED' || getErrorCode(error) === 'NOT_AUTHENTICATED')) {
    return (
      <Block display="flex" justifyContent="center">
        <Label1>You don't have access</Label1>
      </Block>
    );
  }

  if (error) {
    return <Loading />;
  }

  return (
    <Block
      display="flex"
      flexDirection="column"
      paddingTop="24px"
      paddingBottom="24px"
      paddingLeft={["24px", "24px", "60px", "60px"]}
      paddingRight={["24px", "24px", "60px", "60px"]}
    >
      <TeamInfo />
      <Switch>
        <Route exact path="/team/:teamId/:tab" component={TeamDashboardRouter} />
        <Route component={TeamDashboardRouter} />
      </Switch>
    </Block>
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[]} />
      <TeamDashboard />
    </Block>
  );
}
