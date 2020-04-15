import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Select } from 'baseui/select';
import { StatefulDatepicker } from 'baseui/datepicker';
import { TimePicker } from 'baseui/timepicker';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
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
  CREATE_POLL
} from '../constants/mutation';
import {
  venues
} from '../constants/locations';
import { showAlert, getErrorCode } from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

function CreatePollForm() {
  const client = useApolloClient();
  const { teamId } = useParams();
  const history = useHistory();
  const [ form, setForm ] = useState({
    name: '',
    expiration: null
  });
  const [ formError, setFormError ] = useState(null);
  const [ createPoll, { loading: creatingPoll } ] = useMutation(CREATE_POLL);
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
    if (!form.expiration) {
      setFormError('Poll closing time is required');
      return false;
    }
    return true;
  };

  const handleCreatePoll = async () => {
    if (!validateForm()) {
      return;
    }
    const res = await createPoll({
      variables: {
        name: form.name,
        expiration: form.expiration,
        teamId
      }
    }).catch(e => {
      setFormError(e);
    });

    if (res && res.data && res.data.createPoll) {
      showAlert(client, 'Successfully created poll!');
      history.push(`/event/${res.data.createPoll}`);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (creatingPoll) {
    return <Loading message="Creating poll..." />;
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
        <Display4><b>Create Poll</b></Display4>
        <FormControl label="" positive="" error={formError}>
          <Block>
            <FormControl label="Poll Name" error={null} caption="Where you want to go on the product launch">
              <Input
                value={form.name}
                type="text"
                placeholder="poll name"
                onChange={e => {
                  updateForm({
                    name: e.currentTarget.value
                  });
                }}
              />
            </FormControl>
            <FormControl label="Poll Closing Time" caption="YYYY/MM/DD HH:MM" positive="" error={null}>
              <Block display="flex">
                <StatefulDatepicker
                  value={form.expiration ? [form.expiration] : null}
                  onChange={({date}) => updateForm({ expiration: date })}
                  filterDate={(date) => {
                    if (moment(date).isAfter(moment())) {
                      return true;
                    }
                    return false;
                  }}
                />
                {
                  form.expiration &&
                  <Block marginLeft="24px">
                    <TimePicker value={form.expiration} onChange={(date) => updateForm({ expiration: date })} />
                  </Block>
                }
              </Block>
            </FormControl>
          </Block>
        </FormControl>
        <Button onClick={handleCreatePoll}>Create</Button>
      </Block>
    </Block>
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column" height="100vh">
      <HeaderNavigation leftButtons={[]} />
      <Block>
        <CreatePollForm />
      </Block>
    </Block>
  );
}
