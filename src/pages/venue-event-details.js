import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Tag } from 'baseui/tag';
import {
  FaUserFriends,
  FaStickyNote,
  FaUserAlt,
  FaClock
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
  CANCEL_EVENT
} from '../constants/mutation';
import { showAlert } from '../utils';
import Loading from '../components/loading';
import PillButton from '../components/pill-button';

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
  const { eventId } = useParams();
  const [ confirmingCancel, setConfirmingCancel ] = useState(false);
  const [ cancelEvent, { loading } ] = useMutation(CANCEL_EVENT);
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

  return (
    <Block marginTop="24px">
      {
        !confirmingCancel &&
        <Block>
          <PillButton
            kind="secondary"
            onClick={() => setConfirmingCancel(true)}
            overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#D44333'}}}}
          >
            Cancel Event
          </PillButton>
        </Block>
      }
      {
        confirmingCancel &&
        <Block>
          <Label1><b>Please confirm</b></Label1>
          <Block marginTop="8px">
            <PillButton
              kind="secondary"
              onClick={handleCancelEvent}
              loading={loading}
              overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#D44333'}}}}
            >
              Confirm Cancel Event
            </PillButton>
          </Block>
        </Block>
      }
    </Block>
  );
}

export default () => {
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
        <Display4><b>{name ? name : `Event on ${moment(time).calendar()}`}</b></Display4>
        <Block marginLeft="-6px">
          {renderStatus()}
        </Block>
        <Block>
          {isPast && status !== 'CLOSED' && <SuggestClose />}
        </Block>
      </Block>
      <Block marginTop="24px" display="flex">
        <Block flex="1">
          <FaClock color="#727272" />
          <Label1 color="#727272"><b>When</b></Label1>
          <Label1><b>{moment(time).calendar()}</b></Label1>
          <Label1><b>{moment(time).format('h:mm A')} {moment(time).fromNow()}</b></Label1>
        </Block>
        <Block flex="1">
          <FaUserFriends color="#727272" />
          <Label1 color="#727272"><b>Group Size</b></Label1>
          <Label1><b>{groupSize} people</b></Label1>
        </Block>
        <Block flex="1">
          <FaUserAlt color="#727272" />
          <Label1 color="#727272"><b>Contact</b></Label1>
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
            {companyLogo && <img alt="review-logo" height="100%" style={{borderRadius: "10px"}} src={companyLogo} />}
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
    </Block>
  );
}
