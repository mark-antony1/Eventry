import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Switch, Route } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Tabs, Tab } from 'baseui/tabs';
import Input from '../components/input';
import { FormControl } from 'baseui/form-control';
import { Navigation } from 'baseui/side-navigation';
import { Tag } from 'baseui/tag';
import { FaPen } from 'react-icons/fa';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Display4,
  Label1,
  Label3,
} from 'baseui/typography';
import {
  useQuery,
  useMutation,
  useApolloClient
} from '@apollo/react-hooks';

import {
  UPDATE_TEAM_NAME
} from '../constants/mutation';
import {
  GET_CREATED_EVENTS_BY_TEAM,
  GET_UPCOMING_EVENTS_BY_TEAM,
  GET_PAST_EVENTS_BY_TEAM,
  GET_USER_BY_AUTH,
  GET_TEAM_POLLS
} from '../constants/query';

import { getErrorCode, showAlert } from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';
import PillButton from '../components/pill-button';
import Members from '../components/team/members';
import Poll from '../components/team/poll';

function EventCell({ event }) {
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

function NewEvents() {
  const { teamId } = useParams();
  const { data, loading, error } = useQuery(GET_CREATED_EVENTS_BY_TEAM, {
    variables: {
      teamId
    }
  });

  if (loading || error) {
    return <Loading />
  }

  const {
    getCreatedEventsByTeam: events
  } = data;

  return (
    <Block>
      <Block display="flex" alignItems="center">
        <Display4><b>New</b></Display4>
        <Block marginLeft="12px">
          <PillButton size="compact" $as="a" href={`/team/${teamId}/create-event`}>
            Create new event
          </PillButton>
        </Block>
      </Block>
      {!events.length && <Label1><b>No new events</b></Label1>}
      {events.map((event, index) => <EventCell event={event} key={index} />)}
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
    <Block>
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
    <Block>
      <Display4><b>Past</b></Display4>
      {!events.length && <Label1><b>No past events</b></Label1>}
      {events.sort((a, b) => moment(a.time).isBefore(b.time) ? -1 : 1).map((event, index) => <EventCell event={event} key={index} />)}
      <Block display="flex" width="100%" marginTop="12px">
        <Block flex="1" display="flex" flexDirection="column">
          <PillButton kind="minimal" onClick={handlePrevPage} disabled={page === 0}>
            <ChevronLeft size={36} />
          </PillButton>
        </Block>
        <Block flex="1" display="flex" flexDirection="column">
          <PillButton kind="minimal" onClick={handleNextPage} disabled={EVENTS_PER_PAGE !== events.length}>
            <ChevronRight size={36} />
          </PillButton>
        </Block>
      </Block>
    </Block>
  );
}

function Home() {
  return (
    <Block display="flex" flexDirection="column">
      <Block marginBottom="24px">
        <NewEvents />
      </Block>
      <Block display="flex" flexDirection={['column', 'column', 'row', 'row']}>
        <Block flex="1" marginRight="12px">
          <UpcomingEvents />
        </Block>
        <Block flex="1">
          <PastEvents />
        </Block>
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
      <Block flex="1" marginRight="24px">
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
      <Block flex="4">
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

function TeamNameForm({ name, close }) {
  const client = useApolloClient();
  const { teamId } = useParams();
  const [ formError, setFormError ] = useState(null);
  const [ nameValue, setNameValue ] = useState(name || '');
  const [ updateTeamName ] = useMutation(UPDATE_TEAM_NAME);

  const handleUpdateTeamName = async () => {
    const res = await updateTeamName({
      variables: {
        name: nameValue,
        teamId
      },
      refetchQueries: ['GetUserByAuth']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });
    if (res) {
      showAlert(client, "Team name successfully updated");
      close();
    }
  };

  return (
    <FormControl positive="" error={formError}>
      <Block display="flex">
        <Input
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="team name"
        />
        <Block marginLeft="8px">
          <PillButton onClick={handleUpdateTeamName}>Save</PillButton>
        </Block>
        <Block marginLeft="4px">
          <PillButton kind="minimal" onClick={close}>Cancel</PillButton>
        </Block>
      </Block>
    </FormControl>
  );
}

function TeamInfo() {
  const { teamId } = useParams();
  const [ editingName, setEditingName ] = useState(false);
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
      {
        !editingName &&
        <Block display="flex" alignItems="center">
          <Display4><b>{team.name}</b></Display4>
          <Block marginLeft="8px">
            <PillButton kind="minimal" onClick={() => setEditingName(true)}><FaPen /></PillButton>
          </Block>
        </Block>
      }
      {
        editingName && <TeamNameForm name={team.name} close={() => setEditingName(false)} />
      }
      <Block display="flex">
        {company.logo && <Block marginRight="12px"><img alt="review-logo" height="24px" style={{borderRadius: "6px"}} src={company.logo} /></Block>}
        <Label1><b>{company.name}</b></Label1>
      </Block>
    </Block>
  );
}

function TeamDashboard() {
  const history = useHistory();
  const { teamId } = useParams();
  const { loading, error } = useQuery(GET_UPCOMING_EVENTS_BY_TEAM, {
    variables: {
      teamId
    }
  });
  useEffect(() => {
    if (error && getErrorCode(error) === 'NOT_AUTHENTICATED') {
      history.push(`/user?p=signup&from=team/${teamId}`);
    }
  }, [error]);

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
