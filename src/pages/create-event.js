import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import Button from '../components/button';
import Select from '../components/select';
import { StatefulDatepicker } from 'baseui/datepicker';
import { TimePicker } from 'baseui/timepicker';
import Input from '../components/input';
import Checkbox from '../components/checkbox';
import { FormControl } from 'baseui/form-control';
import Textarea from '../components/textarea';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Display4,
  Label1,
} from 'baseui/typography';
import {
  useQuery,
  useMutation,
  useApolloClient
} from '@apollo/react-hooks';
import {
  GET_UPCOMING_EVENTS_BY_TEAM,
  GET_USER_BY_AUTH,
  LOAD_BOOKING_FORM
} from '../constants/query';
import {
  CREATE_EVENT
} from '../constants/mutation';
import {
  venues
} from '../constants/locations';
import { showAlert, getErrorCode, useQueryUrl } from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

function CreateEventForm() {
  const queryUrl = useQueryUrl();
  const client = useApolloClient();
  const { teamId } = useParams();
  const history = useHistory();
  const [ form, setForm ] = useState({
    name: '',
    notify: true
  });
  const [ formError, setFormError ] = useState(null);
  const [ createEvent, { loading: creatingEvent } ] = useMutation(CREATE_EVENT);
  const { loading, error } = useQuery(GET_UPCOMING_EVENTS_BY_TEAM, {
    variables: {
      teamId
    }
  });

  const updateForm = (payload) => {
    setForm({
      ...form,
      ...payload
    });
  };

  const validateForm = () => {
    if (!form.name) {
      setFormError('Please enter event name');
      return false;
    }
    return true;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) {
      return;
    }
    const res = await createEvent({
      variables: {
        name: form.name,
        notify: form.notify,
        symbol: queryUrl.get('symbol') ? queryUrl.get('symbol') : null,
        teamId
      }
    }).catch(e => {
      setFormError(e);
    });

    if (res && res.data && res.data.createEvent) {
      showAlert(client, 'Event successfully created!');
      history.push(`/event/${res.data.createEvent}`);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (creatingEvent) {
    return <Loading message="Creating event..." />;
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
      paddingLeft={["24px", "24px", "60px", "60px"]}
      paddingRight={["24px", "24px", "60px", "60px"]}
      paddingTop="24px"
      paddingBottom="24px"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Block display="flex" flexDirection="column" width={['100%', '100%', '50%', '50%']}>
        <Display4><b>Create Event</b></Display4>
        <FormControl label="Event Name" positive="" error={formError}>
          <Block>
            <Input
              placeholder="name"
              value={form.name}
              onChange={(e) => {
                updateForm({ name: e.target.value })
              }}
            />
            <Block margin="6px" />
            <Checkbox
              checked={form.notify}
              onChange={e => updateForm({ notify: e.target.checked })}
            >
              Notify team member via email
            </Checkbox>
          </Block>
        </FormControl>
        <Button onClick={handleCreateEvent}>Create Event</Button>
      </Block>
    </Block>
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column" height="100vh">
      <HeaderNavigation leftButtons={[]} />
      <Block>
        <CreateEventForm />
      </Block>
    </Block>
  );
}
