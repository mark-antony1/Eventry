import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import { useStyletron } from 'styletron-react';
import { Datepicker } from 'baseui/datepicker';
import { TimePicker } from 'baseui/timepicker';
import { Block } from 'baseui/block';
import { FormControl } from 'baseui/form-control';
import Input from '../components/input';
import { Tag } from 'baseui/tag';
import { ProgressBar } from 'baseui/progress-bar';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'baseui/modal';
import {
  FaLocationArrow,
  FaUserFriends,
  FaStickyNote,
  FaUserAlt,
  FaClock,
  FaPen,
  FaTrashAlt
} from 'react-icons/fa';
import {
  Label1,
  Label3,
  Display4,
  Paragraph1
} from 'baseui/typography';
import {
  useQuery,
  useMutation,
  useApolloClient
} from '@apollo/react-hooks';
import {
  GET_EVENT
} from '../constants/query';
import {
  CLOSE_EVENT,
  CANCEL_EVENT,
  UPDATE_EVENT_NAME,
  UPDATE_EVENT_TIME,
  UPDATE_EVENT_SYMBOL
} from '../constants/mutation';
import { showAlert, getErrorCode } from '../utils';
import { venues as allPhysicalVenues } from '../constants/locations';
import { venues as allVirtualVenues } from '../constants/virtual-locations';
import PillButton from '../components/pill-button';
import Poll, { CreatePollForm } from '../components/team/poll';
import VenueNameSearchBar from '../components/venue/venue-name-search-bar';
import Loading from '../components/loading';

const allVenues = [...allPhysicalVenues, ...allVirtualVenues];

function SuggestClose() {
  const client = useApolloClient();
  const { eventId } = useParams();
  const [ closeEvent, { loading } ] = useMutation(CLOSE_EVENT);
  const handleCloseEvent = async () => {
    const response = await closeEvent({
      variables: {
        eventId
      },
      refetchQueries: ['GetEvent']
    }).catch((e) => {

    });
    if (response) {
      showAlert(client, 'Successfully closed the event');
    }
  };

  return (
    <Block
      marginTop="12px"
      backgroundColor="#CEEDE8"
      width="fit-content"
      padding="16px"
      position="relative"
    >
      <Label1><b>Has event been successfully finished?</b></Label1>
      <Block display="flex" justifyContent="flex-end" marginTop="8px">
        <PillButton loading={loading} onClick={handleCloseEvent}>Yes</PillButton>
      </Block>
    </Block>
  );
}

function CancelEvent() {
  const client = useApolloClient();
  const [ confirmingCancel, setConfirmingCancel ] = useState(false);
  const [ cancelEvent, { loading } ] = useMutation(CANCEL_EVENT);
  const { eventId } = useParams();
  const {
    data: {
      getEvent: { time }
    }
  } = useQuery(GET_EVENT, {
    variables: {
      eventId
    }
  });
  const handleCancelEvent = async () => {
    const response = await cancelEvent({
      variables: {
        eventId
      },
      refetchQueries: ['GetEvent']
    }).catch((e) => {

    });
    if (response) {
      showAlert(client, 'Successfully cancel the event');
    }
  };

  const eventInDay = moment.duration(moment(time).diff(moment())).asHours() < 24;

  return (
    <Block marginTop="24px">
      {
        !confirmingCancel &&
        <Block display="flex" alignItems="center">
          <PillButton
            kind="secondary"
            disabled={eventInDay}
            onClick={() => setConfirmingCancel(true)}
            overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#D44333'}}}}
          >
            Cancel Event
          </PillButton>
          {eventInDay && <Label1 marginLeft="12px">Unable to cancel 24 hours before the event</Label1>}
        </Block>
      }
      {
        confirmingCancel &&
        <Block>
          <Label1><b>Please confirm</b></Label1>
          <Block marginTop="8px">
            <PillButton
              kind="secondary"
              loading={loading}
              onClick={handleCancelEvent}
            >
              Confirm Cancel Event
            </PillButton>
          </Block>
        </Block>
      }
    </Block>
  );
}

function NameForm({ name, close }) {
  const client = useApolloClient();
  const { eventId } = useParams();
  const [ nameValue, setNameValue ] = useState(name || '');
  const [ updateEventName ] = useMutation(UPDATE_EVENT_NAME);

  const handleUpdateEventName = async () => {
    const res = await updateEventName({
      variables: {
        name: nameValue,
        eventId
      },
      refetchQueries: ['GetEvent']
    });
    if (res) {
      showAlert(client, "Successfully updated event name");
      close();
    }
  };

  return (
    <Block display="flex">
      <Input
        value={nameValue}
        onChange={(e) => setNameValue(e.target.value)}
        placeholder="event name"
      />
      <Block marginLeft="8px">
        <PillButton onClick={handleUpdateEventName}>Save</PillButton>
      </Block>
      <Block marginLeft="4px">
        <PillButton kind="minimal" onClick={close}>Cancel</PillButton>
      </Block>
    </Block>
  );
}

function TimeForm({ time, showForm, close }) {
  const client = useApolloClient();
  const [ form, setForm ] = useState({
    time: time ? new Date(time) : null
  });
  const { eventId } = useParams();
  const [ formError, setFormError ] = useState(null);
  const [ updateEventTime, { loading: updating } ] = useMutation(UPDATE_EVENT_TIME);
  const validateForm = () => {
    if (!form.time) {
      setFormError('Time is required');
      return false;
    }

    return true;
  };
  const updateForm = (payload) => {
    setForm({
      ...form,
      ...payload
    });
  };
  const handleUpdateEventTime = async () => {
    if (!validateForm()) {
      return;
    }

    const res = await updateEventTime({
      variables: {
        eventId,
        time: form.time
      },
      refetchQueries: ['GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res) {
      showAlert(client, "Successfully updated event time");
      close();
    }
  };
  return (
    <Modal onClose={close} isOpen={showForm}>
      <ModalHeader>Event Time</ModalHeader>
      <ModalBody>
        <FormControl label="Time" caption="YYYY/MM/DD HH:MM" positive="" error={formError}>
          <Block display="flex">
            <Datepicker
              value={form.time ? [form.time] : null}
              onChange={({date}) => updateForm({ time: date })}
              filterDate={(date) => {
                if (moment(date).isAfter(moment())) {
                  return true;
                }
                return false;
              }}
            />
            {
              form.time &&
              <Block marginLeft="24px">
                <TimePicker
                  value={form.time}
                  onChange={(date) => updateForm({ time: date })}
                  overrides={{
                    Select: {
                      props: {
                        overrides: {
                          ControlContainer: {
                            style: {
                              borderRadius: '5px !important',
                              backgroundColor: '#fff !important'
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </Block>
            }
          </Block>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <PillButton loading={updating} onClick={handleUpdateEventTime}>Save</PillButton>
      </ModalFooter>
    </Modal>
  );
}

function RemoveVenueModalForm({ showForm, close }) {
  const client = useApolloClient();
  const { eventId } = useParams();
  const [ formError, setFormError ] = useState(null);
  const [ updateEventSymbol, { loading: updating } ] = useMutation(UPDATE_EVENT_SYMBOL);

  const handleRemoveVenue = async () => {
    const res = await updateEventSymbol({
      variables: {
        eventId,
        symbol: null
      },
      refetchQueries: ['GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res) {
      showAlert(client, "Venue successfully removed");
      close();
    }
  };
  return (
    <Modal onClose={close} isOpen={showForm}>
      <ModalHeader>Remove Venue</ModalHeader>
      <ModalFooter>
        <PillButton loading={updating} onClick={handleRemoveVenue}>Remove</PillButton>
      </ModalFooter>
    </Modal>
  );
}

function VenueModalForm({ showForm, close }) {
  const client = useApolloClient();
  const [ form, setForm ] = useState({
    venue: null
  });
  const { eventId } = useParams();
  const [ formError, setFormError ] = useState(null);
  const [ updateEventSymbol, { loading: updating } ] = useMutation(UPDATE_EVENT_SYMBOL);
  const updateForm = (payload) => {
    setForm({
      ...form,
      ...payload
    });
  };
  const handleUpdateEventTime = async () => {
    const res = await updateEventSymbol({
      variables: {
        eventId,
        symbol: form.venue.id
      },
      refetchQueries: ['GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res) {
      showAlert(client, "Venue successfully updated");
      close();
    }
  };
  return (
    <Modal onClose={close} isOpen={showForm}>
      <ModalHeader>Venue</ModalHeader>
      <ModalBody>
        <FormControl label="Search venues by name" positive="" error={formError}>
          <Block display="flex">
            <VenueNameSearchBar updateForm={updateForm} form={form} />
          </Block>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <PillButton loading={updating} onClick={handleUpdateEventTime}>Save</PillButton>
      </ModalFooter>
    </Modal>
  );
}

function VenueForm() {
  const [ css ] = useStyletron();
  const { eventId } = useParams();
  const [ form, setForm ] = useState({
    venue: null
  });
  const [ selectedVenueSymbol, setSelectedVenueSymbol ] = useState(null);
  const [ updateEventSymbol, { loading: submitting } ] = useMutation(UPDATE_EVENT_SYMBOL);
  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: {
      eventId
    }
  });
  if (loading || error || submitting) {
    return <Loading />;
  }

  const {
    getEvent: {
      polls
    }
  } = data;

  const handleSelectVenue = (payload) => {
    setForm({
      ...form,
      ...payload
    });
    setSelectedVenueSymbol(payload.venue.id);
  };

  const handleSubmitForm = async () => {
    await updateEventSymbol({
      variables: {
        eventId,
        symbol: selectedVenueSymbol
      },
      refetchQueries: ['GetEvent']
    }).catch(e => {

    });
  };

  const topPollItems = polls.reduce((list, poll) => {
      return [ ...list, ...poll.pollLineItems ];
    }, [])
    .sort((a, b) => {
      return b.voters.length - a.voters.length;
    }).slice(0, 3);
  const renderTopPollItems = () => {

    return (
      <Block display="flex" flexDirection="column">
        {
          topPollItems.map(pollItem => {
            const venue = allVenues.find(v => v.symbol === pollItem.symbol);
            if (!venue) {
              return null;
            }
            return (
              <Block
                key={pollItem.id}
                flex="1"
                backgroundColor={(selectedVenueSymbol === pollItem.symbol) ? "#77BA01" : "#ddd"}
                paddingTop="12px"
                paddingBottom="12px"
                paddingLeft="24px"
                paddingRight="24px"
                marginTop="4px"
                display="flex"
                alignItems="center"
                className={css({
                  cursor: 'pointer',
                  borderRadius: '500px',
                  ':hover': {
                    backgroundColor: "#77BA01"
                  }
                })}
                onClick={() => {
                  setSelectedVenueSymbol(pollItem.symbol);
                  setForm({ venue: null });
                }}
              >
                <Label1><b>{venue.name}</b></Label1>
              </Block>
            );
          })
        }
      </Block>
    );
  };

  return (
    <Block display="flex" flexDirection="column" backgroundColor="#f7f7f7" padding="24px">
      <Block display="flex" alignItems="center">
        <Block display={['none', 'none', 'initial', 'initial']}>
          <Tag closeable={false} variant="outlined" kind="warning"><b>Next step</b></Tag>
        </Block>
        <Display4 marginLeft="12px"><b>Have You Decided The Venue?</b></Display4>
      </Block>
      {
        topPollItems.length ?
        <FormControl error={null} label="Choose the venue for the event" positive="">
          <Block display="flex" flexDirection="column">
            {renderTopPollItems()}
          </Block>
        </FormControl> : null
      }
      <FormControl error={null} label="Search venues by name" positive="">
        <VenueNameSearchBar updateForm={handleSelectVenue} form={form} />
      </FormControl>
      <Block display="flex" justifyContent="center">
        <PillButton disabled={!selectedVenueSymbol} onClick={handleSubmitForm}>Select</PillButton>
      </Block>
    </Block>
  );
}

function VenueInfo({ openVenueForm, openRemoveVenueForm }) {
  const { eventId } = useParams();
  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: {
      eventId
    }
  });
  if (loading || error) {
    return <Loading />;
  }

  const {
    getEvent: {
      symbol,
      venue,
      status
    }
  } = data;

  if (!symbol && !venue) {
    return (
      <Block>
        <FaLocationArrow color="#727272" />
        <Block display="flex" alignItems="center">
          <Label1 color="#727272"><b>Where</b></Label1>
          {
            status === 'CREATED' &&
            <Block marginLeft="4px">
              <PillButton size="compact" kind="minimal" onClick={openVenueForm}><FaPen /></PillButton>
            </Block>
          }
        </Block>
        <Label1><b>N/A</b></Label1>
      </Block>
    );
  }

  if (symbol) {
    const venue = allVenues.find((v) => v.symbol === symbol);
    if (!venue) {
      return null;
    }

    return (
      <Block>
        <FaLocationArrow color="#727272" />
        <Block display="flex" alignItems="center">
          <Label1 color="#727272"><b>Where</b></Label1>
          {
            status === 'CREATED' &&
            <Block marginLeft="4px">
              <PillButton size="compact" kind="minimal" onClick={openVenueForm}><FaPen /></PillButton>
            </Block>
          }
          {
            status === 'CREATED' && symbol &&
            <Block marginLeft="4px">
              <PillButton size="compact" kind="minimal" onClick={openRemoveVenueForm}><FaTrashAlt /></PillButton>
            </Block>
          }
        </Block>
        <Block display="flex" alignItems="center">
          <Label1><b>{venue.name}</b></Label1>
          <Label3 marginLeft="8px" $as="a" href={`/${venue.symbol}`} target="_blank">Details</Label3>
        </Block>
      </Block>
    );
  }

  return null;
}

export default () => {
  const { eventId } = useParams();
  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: {
      eventId
    }
  });
  const [ validPollExist, setValidPollExist ] = useState(false);
  const [ hidePoll, setHidePoll ] = useState(false);
  const [ removingVenue, setRemovingVenue ] = useState(false);
  const [ creatingPoll, setCreatingPoll ] = useState(false);
  const [ editingVenue, setEditingVenue ] = useState(false);
  const [ editingTime, setEditingTime ] = useState(false);
  const [ editingName, setEditingName ] = useState(false);

  useEffect(() => {
    if (data && data.getEvent) {
      const { polls } = data.getEvent;
      const areAllPastPolls = polls.reduce((agg, poll) => {
        if (!moment(poll.expiration).isBefore(moment())) {
          return false;
        }
        return agg;
      }, true);
      if (areAllPastPolls) {
        setHidePoll(true);
      } else {
        setHidePoll(false);
        setValidPollExist(true);
      }
    }
  }, [data]);
  if (loading || error) {
    return <Loading />;
  }

  const {
    getEvent: {
      time,
      status,
      groupSize,
      name,
      masterPhoneNumber,
      teams,
      note,
      master: {
        firstName: masterFirstName,
        lastName: masterLastName,
        email: masterEmail,
        company: {
          name: companyName,
          logo: companyLogo
        }
      },
      polls,
      symbol,
      venue
    }
  } = data;

  const isPast = moment(time).isBefore(moment());

  const getStatus = () => {
    let progress = 0;
    let label = '';
    if (status === 'CANCELLED') {
      // cancelled
      progress = 0;
      label = 'Event is Cancelled';
    } else if (isPast) {
      // past event
      progress = 100;
      label = 'Past Event';
    } else if (status === 'READY') {
      // event is booked
      progress = 100;
      label = 'You are All Set! Event is Ready';
    } else if (status === 'CREATED' && polls.length && validPollExist) {
      // poll is actively being conducted
      progress = 50;
      label = 'Poll is Actively Being Conducted';
    } else if (status === 'CREATED' && symbol && time) {
      // symbol selected, time selected
      progress = 100;
      label = 'You are All Set! Event is Ready';
    } else if (status === 'CREATED' && time) {
      // symbol selected, time selected
      progress = 80;
      label = 'Finalize The Venue';
    } else if (status === 'CREATED' && symbol) {
      // symbol selected
      progress = 80;
      label = 'Finalize The schedule';
    } else if (status === 'CREATED' && polls.length && !validPollExist) {
      // all poll is expired
      progress = 50;
      label = 'Poll is Over, Select The Venue';
    } else if (status === 'CREATED') {
      // created, no polls
      label = 'Conduct the Poll or Select The Venue';
      progress = 20;
    }

    return {
      progress,
      progressLabel: label
    };
  };

  const {
    progress,
    progressLabel
  } = getStatus();

  return (
    <Block display="flex" flexDirection="column" paddingLeft={["24px", "24px", "60px", "60px"]} paddingRight={["24px", "24px", "60px", "60px"]} paddingTop="24px" paddingBottom="24px">
      <Block>
        {
          !editingName &&
          <Block display="flex" alignItems={["flex-start", "flex-start", "center", "center"]} flexDirection={['column', 'column', 'row', 'row']}>
            <Display4>
              <b>
                {
                  name ? name :
                    (
                      time ?
                      `Event on ${moment(time).calendar()}` :
                      'Upcoming event...'
                    )
                }
              </b>
            </Display4>
            <Block marginLeft="8px" display={['none', 'none', 'initial', 'initial']}>
              <PillButton kind="minimal" onClick={() => setEditingName(true)}><FaPen /></PillButton>
            </Block>
            <Block margin="6px" />
            <Block
              backgroundColor="#000"
              padding="12px"
              overrides={{
                Block: {
                  style: {
                    borderRadius: '20px'
                  }
                }
              }}
            >
              <span style={{ color: '#fff'}}>{progressLabel}</span>
            </Block>
          </Block>
        }
        {
          editingName && <NameForm name={name} close={() => setEditingName(false)} />
        }
        <Block marginLeft="-6px">
          <ProgressBar
            value={progress}
            successValue={100}
            overrides={{
              BarProgress: {
                style: {
                  backgroundColor: '#77BA01'
                }
              },
              Bar: {
                style: {
                  height: '24px'
                }
              }
            }}
            getProgressLabel={(value) => {
              if (value !== 0) {
                return `${value}% ready for event`;
              }
              return null;
            }}
            showLabel
          />
        </Block>
        <Block marginTop="24px" padding="24px" marginBottom="24px" display="flex" flexDirection="column" backgroundColor="#f7f7f7">
          <Block display="flex" alignItems="center" paddingBottom="12px">
            {
              (polls.length || (symbol || venue)) ?
              <Tag closeable={false} variant="outlined" kind="accent"><b>Choose what to do</b></Tag> :
              <Tag closeable={false} variant="outlined" kind="warning"><b>Next step</b></Tag>
            }
            <Block display="flex" alignItems="center">
              <Display4 marginLeft="12px"><b>Poll</b></Display4>
              <Block marginLeft="12px" />
              <Block display={['none', 'none', 'initial', 'initial']}>
                <PillButton size="compact" kind="secondary" onClick={() => setCreatingPoll(true)}>Create New Poll</PillButton>
              </Block>
            </Block>
          </Block>
          {
            (!hidePoll && polls.length) ?
            <Block>
              {
                polls.map((poll) => {
                  return <Poll key={poll.id} poll={poll} />;
                })
              }
            </Block> : null
          }
          {
            (hidePoll && polls.length) ?
            <Block display="flex" alignItems="center">
              Poll is expired
              <Block marginLeft="8px">
                <PillButton kind="secondary" onClick={() => setHidePoll(false)}>See Past Poll</PillButton>
              </Block>
            </Block> : null
          }
          {
            !polls.length ?
            <Block display="flex" alignItems="center">
              No poll yet
              <Block marginLeft="8px">
                <PillButton kind="secondary" onClick={() => setCreatingPoll(true)}>Create First Poll</PillButton>
              </Block>
            </Block> : null
          }
        </Block>
        <Block>
          {isPast && status !== 'CLOSED' && <SuggestClose />}
        </Block>
        {
          (!symbol && !venue && polls.length) ? <VenueForm /> : null
        }
      </Block>
      <Block marginTop="24px" display="flex" flexWrap="wrap">
        <Block flex="0 1 33%" marginBottom="24px">
          <VenueInfo openVenueForm={() => setEditingVenue(true)} openRemoveVenueForm={() => setRemovingVenue(true)} />
        </Block>
        <Block flex="0 1 33%" marginBottom="24px">
          <FaClock color="#727272" />
          <Block display="flex" alignItems="center">
            <Label1 color="#727272"><b>When</b></Label1>
            {
              status === 'CREATED' &&
              <Block marginLeft="4px">
                <PillButton size="compact" kind="minimal" onClick={() => setEditingTime(true)}><FaPen /></PillButton>
              </Block>
            }
          </Block>
          {
            time ?
              <Block>
                <Label1><b>{moment(time).calendar()}</b></Label1>
                <Label1><b>{moment(time).format('h:mm A')} {moment(time).fromNow()}</b></Label1>
              </Block> :
              <Block display="flex" alignItems="center">
                <Label1><b>Please select time</b></Label1>
              </Block>
          }
        </Block>
        <Block flex="0 1 33%" marginBottom="24px">
          <FaUserFriends color="#727272" />
          <Label1 color="#727272"><b>Group Size</b></Label1>
          {
            groupSize ?
            <Label1><b>{groupSize} people</b></Label1> :
            <Label1><b>N/A</b></Label1>
          }
        </Block>
        <Block flex="0 1 33%" marginBottom="24px">
          <FaUserAlt color="#727272" />
          <Label1 color="#727272"><b>Event Owner</b></Label1>
          <Label1><b>{masterFirstName} {masterLastName} at {companyName}</b></Label1>
          <Label1><b>{masterEmail}</b></Label1>
          <Label1><b>{masterPhoneNumber}</b></Label1>
        </Block>
        <Block flex="0 1 33%" marginBottom="24px">
          <FaStickyNote color="#727272" />
          <Label1 color="#727272"><b>Note</b></Label1>
          <Paragraph1><b>{note}</b></Paragraph1>
        </Block>
        <Block flex="0 1 33%" marginBottom="24px">
          <Block height="50px" display="flex" alignItems="flex-end">
            {companyLogo && <img alt="review-logo" height="100%" src={companyLogo} style={{borderRadius: "10px"}}/>}
          </Block>
          {
            teams.map((team, index) => {
              return <Label1 key={index}><b>{team.name}</b></Label1>;
            })
          }
          <Label1><b>at {companyName}</b></Label1>
        </Block>
      </Block>
      <Block>
        {!isPast && status !== 'CLOSED' && status !== 'CANCELLED' && <CancelEvent />}
      </Block>
      <TimeForm showForm={editingTime} close={() => setEditingTime(false)} time={time} />
      <VenueModalForm showForm={editingVenue} close={() => setEditingVenue(false)} />
      <RemoveVenueModalForm showForm={removingVenue} close={() => setRemovingVenue(false)} />
      <CreatePollForm showForm={creatingPoll} close={() => setCreatingPoll(false)} />
    </Block>
  );
}
