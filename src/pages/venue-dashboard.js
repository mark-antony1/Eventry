import React, { useState } from 'react';
import { useParams, useHistory, useLocation, Switch, Route } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import moment from 'moment-timezone';
import { FaTrashAlt } from 'react-icons/fa';
import Plus from 'baseui/icon/plus';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs';
import { FormControl } from 'baseui/form-control';
import { Tag } from 'baseui/tag';
import { Select } from 'baseui/select';
import { Navigation } from 'baseui/side-navigation';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Display4,
  Label1,
  Label3,
} from 'baseui/typography';
import {
  useQuery,
  useMutation
} from '@apollo/react-hooks';

import {
  DELETE_BUSINESS_HOUR,
  CREATE_BUSINESS_HOUR
} from '../constants/mutation';
import {
  GET_NEW_EVENTS_BY_SYMBOL,
  GET_UPCOMING_EVENTS_BY_SYMBOL,
  GET_PAST_EVENTS_BY_SYMBOL,
  GET_BUSINESS_HOURS
} from '../constants/query';

import { venues } from '../constants/locations';
import { getErrorCode, getHourFromMilitaryHour } from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

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

function NewEvents() {
  const { venueSymbol: symbol } = useParams();
  const { data, loading, error } = useQuery(GET_NEW_EVENTS_BY_SYMBOL, {
    variables: {
      symbol
    }
  });

  if (loading || error) {
    return <Loading />
  }

  const {
    getNewEventsBySymbol: events
  } = data;

  return (
    <Block padding="8px">
      <Display4><b>New</b></Display4>
      {!events.length && <Label1><b>No events requested in last 12 hours</b></Label1>}
      {events.sort((a, b) => moment(a.createdAt).isBefore(b.createdAt) ? 1 : -1).map((event, index) => <EventCell event={event} key={index} />)}
    </Block>
  );
}

function UpcomingEvents() {
  const { venueSymbol: symbol } = useParams();
  const { data, loading, error } = useQuery(GET_UPCOMING_EVENTS_BY_SYMBOL, {
    variables: {
      symbol
    }
  });

  if (loading || error) {
    return <Loading />
  }

  const {
    getUpcomingEventsBySymbol: events
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
  const { venueSymbol: symbol } = useParams();
  const [ page, setPage ] = useState(0);
  const { data, loading, error } = useQuery(GET_PAST_EVENTS_BY_SYMBOL, {
    variables: {
      symbol,
      skip: page * EVENTS_PER_PAGE
    }
  });

  if (loading || error) {
    return <Loading />;
  }

  const {
    getPastEventsBySymbol: events
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

const dayOptions = [
  {
    title: "Sun",
    itemId: "#sun",
    index: 0
  },
  {
    title: "Mon",
    itemId: "#mon",
    index: 1
  },
  {
    title: "Tue",
    itemId: "#tue",
    index: 2
  },
  {
    title: "Wed",
    itemId: "#wed",
    index: 3
  },
  {
    title: "Thu",
    itemId: "#thu",
    index: 4
  },
  {
    title: "Fri",
    itemId: "#fri",
    index: 5
  },
  {
    title: "Sat",
    itemId: "#sat",
    index: 6
  }
];

function BusinessHour({ hour }) {
  const { venueSymbol: symbol } = useParams();
  const [ css ] = useStyletron();
  const [ confirmingDelete, setConfirmingDelete ] = useState(false);
  const [ deleteBusinessHour, { loading } ] = useMutation(DELETE_BUSINESS_HOUR);
  const handleDeleteBusinessHour = async () => {
    await deleteBusinessHour({
      variables: {
        businessHourId: hour.id,
        symbol
      },
      refetchQueries: ['GetBusinessHours']
    }).catch(e => {

    });
  };

  if (loading) {
    return <Loading />;
  }

  if (confirmingDelete) {
    return (
      <Block display="flex" alignItems="center" margin="12px">
        <Label1><b>Delete {getHourFromMilitaryHour(hour.open)} - {getHourFromMilitaryHour(hour.close)}?</b></Label1>
        <Block marginLeft="12px">
          <Button onClick={handleDeleteBusinessHour}>Yes</Button>
        </Block>
      </Block>
    );
  }

  return (
    <Block display="flex" alignItems="center" margin="12px">
      <Label1><b>{getHourFromMilitaryHour(hour.open)} - {getHourFromMilitaryHour(hour.close)}</b></Label1>
      <Block
        marginLeft="12px"
        className={css({
          cursor: 'pointer',
          ':hover': {
            opacity: 0.6
          }
        })}
        onClick={() => setConfirmingDelete(true)}
      >
        <Label1><FaTrashAlt /></Label1>
      </Block>
    </Block>
  );
}

const hourOptions = [
  {
    label: '0AM',
    id: 0
  },
  {
    label: '1AM',
    id: 1
  },
  {
    label: '2AM',
    id: 2
  },
  {
    label: '3AM',
    id: 3
  },
  {
    label: '4AM',
    id: 4
  },
  {
    label: '5AM',
    id: 5
  },
  {
    label: '6AM',
    id: 6
  },
  {
    label: '7AM',
    id: 7
  },
  {
    label: '8AM',
    id: 8
  },
  {
    label: '9AM',
    id: 9
  },
  {
    label: '10AM',
    id: 10
  },
  {
    label: '11AM',
    id: 11
  },
  {
    label: '12PM',
    id: 12
  },
  {
    label: '1PM',
    id: 13
  },
  {
    label: '2PM',
    id: 14
  },
  {
    label: '3PM',
    id: 15
  },
  {
    label: '4PM',
    id: 16
  },
  {
    label: '5PM',
    id: 17
  },
  {
    label: '6PM',
    id: 18
  },
  {
    label: '7PM',
    id: 19
  },
  {
    label: '8PM',
    id: 20
  },
  {
    label: '9PM',
    id: 21
  },
  {
    label: '10PM',
    id: 22
  },
  {
    label: '11PM',
    id: 23
  },
  {
    label: '12PM',
    id: 24
  },
];

function BusinessHourForm({ activeIndex: day, activeHours }) {
  const { venueSymbol: symbol } = useParams();
  const [ createBusinessHourError, setCreateBusinessHourError ] = useState(null);
  const [ showForm, setShowForm ] = useState(false);
  const [ open, setOpen ] = useState(null);
  const [ close, setClose ] = useState(null);
  const [ createBusinessHour, { loading } ] = useMutation(CREATE_BUSINESS_HOUR);

  const validateForm = () => {
    if (!open || !close) {
      setCreateBusinessHourError('Please select the open and close hours');
      return false;
    }
    if (open[0].id >= close[0].id) {
      setCreateBusinessHourError('Open hour must be before close hour');
      return false;
    }
    return activeHours.reduce((res, h) => {
      if (open[0].id >= h.open && open[0].id <= h.close) {
        setCreateBusinessHourError('Hours cannot be overwrapped with existing hours');
        return false;
      }
      if (close[0].id >= h.open && close[0].id <= h.close) {
        setCreateBusinessHourError('Hours cannot be overwrapped with existing hours');
        return false;
      }
      if (open[0].id <= h.open && close[0].id >= h.close) {
        setCreateBusinessHourError('Hours cannot be overwrapped with existing hours');
        return false;
      }
      return res;
    }, true);
  };

  const handleCreateBusinessHour = async () => {
    if (!validateForm()) {
      return;
    }

    const response = await createBusinessHour({
      variables: {
        open: open[0].id,
        close: close[0].id,
        day,
        symbol
      },
      refetchQueries: ['GetBusinessHours']
    }).catch((e) => {
      setCreateBusinessHourError(getErrorCode(e));
    });

    if (response) {
      setShowForm(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (showForm) {
    return (
      <Block>
        <FormControl error={createBusinessHourError} positive="">
          <Block marginTop="12px" display="flex" alignItems="center">
            <Label1 marginRight="12px"><b>Open</b></Label1>
            <Block>
              <Select
                options={hourOptions}
                value={open}
                placeholder="Select"
                onChange={params => setOpen(params.value)}
              />
            </Block>
            <Label1 marginLeft="12px" marginRight="12px"><b>Close</b></Label1>
            <Block>
              <Select
                options={hourOptions}
                value={close}
                placeholder="Select"
                onChange={params => setClose(params.value)}
              />
            </Block>
            <Block marginLeft="12px">
              <Button onClick={handleCreateBusinessHour}>
                <Plus />
                Add
              </Button>
            </Block>
          </Block>
        </FormControl>
      </Block>
    );
  }
  return (
    <Block marginTop="12px">
      <Button onClick={() => setShowForm(true)}>
        <Plus />
        Add new business hour
      </Button>
    </Block>
  );
}

function BusinessHours() {
  const location = useLocation();
  const [ activeIndex, setActiveIndex ] = useState(dayOptions.find(o => o.itemId === location.hash) ? dayOptions.find(o => o.itemId === location.hash).index : 0);
  const { venueSymbol: symbol } = useParams();
  const { data, loading, error } = useQuery(GET_BUSINESS_HOURS, {
    variables: {
      symbol
    }
  });

  if (loading || error) {
    return <Loading />;
  }

  const {
    getBusinessHours: businessHours
  } = data;

  const activeHours = businessHours.filter((h) => h.day === activeIndex);
  return (
    <Block display="flex">
      <Navigation
        items={dayOptions}
        activeItemId={location.hash || '#sun'}
        onChange={({ item }) => {
          setActiveIndex(item.index);
        }}
      />
      <Block display="flex" flexDirection="column" flex="1" alignItems="center" justifyContent="center">
        <Display4><b>{dayOptions[activeIndex].title}</b></Display4>
        {
          activeHours.sort((a, b) => a.open - b.open).map((hour) => {
            return (
              <BusinessHour key={hour.id} hour={hour} />
            );
          })
        }
        {
          !activeHours.length &&
          <Label1><b>No business hours on {dayOptions[activeIndex].title}, add the first business hour!</b></Label1>
        }
        <BusinessHourForm activeHours={activeHours} activeIndex={activeIndex} />
      </Block>
    </Block>
  );
}

function Events() {
  return (
    <Block display="flex" flexDirection={['column', 'column', 'row', 'row']}>
      <Block flex="1">
        <NewEvents />
      </Block>
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
  'events',
  'business-hours'
];


function VenueDashboardRouter() {
  const { venueSymbol: symbol, tab } = useParams();
  const history = useHistory();

  return (
    <Block marginTop="12px">
      <Tabs
        onChange={({ activeKey }) => {
          history.push(`/${symbol}/dashboard/${TABS[activeKey]}`);
        }}
        activeKey={TABS.indexOf(tab) === -1 ? String(0) : String(TABS.indexOf(tab))}
      >
        <Tab title="Events" />
        <Tab title="Business Hours" />
      </Tabs>
      <Block>
        {
          (!tab || tab === 'events') && <Events />
        }
        {
          (tab === 'business-hours') && <BusinessHours />
        }
      </Block>
    </Block>
  );
}

function VenueDashboard() {
  const { venueSymbol: symbol } = useParams();
  const { loading, error } = useQuery(GET_NEW_EVENTS_BY_SYMBOL, {
    variables: {
      symbol
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

  const venue = venues.find((v) => v.symbol === symbol);

  return (
    <Block display="flex" flexDirection="column" paddingLeft={["24px", "24px", "60px", "60px"]} paddingRight={["24px", "24px", "60px", "60px"]} paddingTop="24px" paddingBottom="24px">
      <Block>
        <Display4><b>{venue.name}</b></Display4>
        <Label1><b>{venue.teaserDescription}</b></Label1>
      </Block>
      <Switch>
        <Route exact path="/:venueSymbol/dashboard/:tab" component={VenueDashboardRouter} />
        <Route component={VenueDashboardRouter} />
      </Switch>
    </Block>
  );
}
export default () => {

  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[]} />
      <VenueDashboard />
    </Block>
  );
}
