import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import { Datepicker } from 'baseui/datepicker';
import { TimePicker } from 'baseui/timepicker';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Tag } from 'baseui/tag';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import {
  FaUserFriends,
  FaStickyNote,
  FaUserAlt,
  FaClock,
  FaPen
} from 'react-icons/fa';
import {
  Label1,
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
  UPDATE_EVENT_TIME
} from '../constants/mutation';
import { showAlert, getErrorCode } from '../utils';
import Poll from '../components/team/poll';
import Loading from '../components/loading';

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
      {loading && <Loading compact={true} />}
      <Label1><b>Has event been successfully finished?</b></Label1>
      <Block display="flex" justifyContent="flex-end" marginTop="8px">
        <Button onClick={handleCloseEvent}>Yes</Button>
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
      {loading && <Loading compact={true} />}
      {
        !confirmingCancel &&
        <Block display="flex" alignItems="center">
          <Button
            kind="secondary"
            disabled={eventInDay}
            onClick={() => setConfirmingCancel(true)}
            overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#D44333'}}}}
          >
            Cancel Event
          </Button>
          {eventInDay && <Label1 marginLeft="12px">Unable to cancel 24 hours before the event</Label1>}
        </Block>
      }
      {
        confirmingCancel &&
        <Block>
          <Label1><b>Please confirm</b></Label1>
          <Block marginTop="8px">
            <Button
              kind="secondary"
              onClick={handleCancelEvent}
              overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#D44333'}}}}
            >
              Confirm Cancel Event
            </Button>
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
      <Button onClick={handleUpdateEventName}>Save</Button>
      <Button kind="minimal" onClick={close}>Cancel</Button>
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
      {updating && <Loading compact={true} message="Save time..." />}
      <ModalHeader>Event Time</ModalHeader>
      <ModalBody>
        {
          !updating &&
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
                  <TimePicker value={form.time} onChange={(date) => updateForm({ time: date })} />
                </Block>
              }
            </Block>
          </FormControl>
        }
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={handleUpdateEventTime}>Save</ModalButton>
      </ModalFooter>
    </Modal>
  );
}

export default () => {
  const { eventId } = useParams();
  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: {
      eventId
    }
  });
  const [ editingTime, setEditingTime ] = useState(false);
  const [ editingName, setEditingName ] = useState(false);

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
      polls
    }
  } = data;

  const isPast = moment(time).isBefore(moment());

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

  return (
    <Block display="flex" flexDirection="column" paddingLeft={["24px", "24px", "60px", "60px"]} paddingRight={["24px", "24px", "60px", "60px"]} paddingTop="24px" paddingBottom="24px">
      <Block>
        {
          !editingName &&
          <Block display="flex">
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
            <Block marginLeft="8px">
              <Button kind="minimal" onClick={() => setEditingName(true)}><FaPen /></Button>
            </Block>
          </Block>
        }
        {
          editingName && <NameForm name={name} close={() => setEditingName(false)} />
        }
        <Block marginLeft="-6px">
          {renderStatus()}
        </Block>
        {
          polls.length ?
          <Block paddingTop="24px" paddingBottom="24px">
            {
              polls.map((poll) => {
                return <Poll key={poll.id} poll={poll} />;
              })
            }
          </Block> : null
        }
        <Block>
          {isPast && status !== 'CLOSED' && <SuggestClose />}
        </Block>
      </Block>
      <Block marginTop="24px" display="flex">
        <Block flex="1">
          <FaClock color="#727272" />
          <Block display="flex" alignItems="center">
            <Label1 color="#727272"><b>When</b></Label1>
            {
              status === 'CREATED' &&
              <Block marginLeft="4px">
                <Button size="compact" kind="minimal" onClick={() => setEditingTime(true)}><FaPen /></Button>
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
        <Block flex="1">
          <FaUserFriends color="#727272" />
          <Label1 color="#727272"><b>Group Size</b></Label1>
          {
            groupSize ?
            <Label1><b>{groupSize} people</b></Label1> :
            <Label1><b>Undecided</b></Label1>
          }
        </Block>
        <Block flex="1">
          <FaUserAlt color="#727272" />
          <Label1 color="#727272"><b>Master</b></Label1>
          <Label1><b>{masterFirstName} {masterLastName} at {companyName}</b></Label1>
          <Label1><b>{masterEmail}</b></Label1>
          <Label1><b>{masterPhoneNumber}</b></Label1>
        </Block>
      </Block>
      <Block marginTop="24px" display="flex">
        <Block flex="1">
          <FaStickyNote color="#727272" />
          <Label1 color="#727272"><b>Note</b></Label1>
          <Paragraph1><b>{note}</b></Paragraph1>
        </Block>
        <Block flex="1">
          <Block height="50px" display="flex" alignItems="flex-end">
            {companyLogo && <img alt="review-logo" height="100%" src={companyLogo} />}
          </Block>
          {
            teams.map((team, index) => {
              return <Label1 key={index}><b>{team.name}</b></Label1>;
            })
          }
          <Label1><b>at {companyName}</b></Label1>
        </Block>
        <Block flex="1">
        </Block>
      </Block>
      <Block>
        {!isPast && status !== 'CLOSED' && status !== 'CANCELLED' && <CancelEvent />}
      </Block>
      <TimeForm showForm={editingTime} close={() => setEditingTime(false)} time={time} />
    </Block>
  );
}
