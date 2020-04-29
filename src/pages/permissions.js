import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import { useApolloClient } from '@apollo/react-hooks';
import { Block } from 'baseui/block';
import { Card } from 'baseui/card';
import Button from '../components/button';
import { FormControl } from 'baseui/form-control';
import Input from '../components/input';
import { Tag } from 'baseui/tag';
import Select from '../components/select';
import { FaCalendarAlt } from 'react-icons/fa';
import { GoogleLogin } from 'react-google-login';
import PillButton from '../components/pill-button';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';
import {
  Display4,
  Paragraph1,
  Label1,
  Label3
} from 'baseui/typography';
import {
  useQuery,
  useMutation,
  useLazyQuery
} from '@apollo/react-hooks';

import {
  getErrorCode,
} from '../utils';
import { venues } from '../constants/locations';
import {
  GET_SCOPES_BY_AUTH,
  GET_USER_BY_AUTH
} from '../constants/query';
import {
  UPDATE_GOOGLE_REFRESH_TOKEN
} from '../constants/mutation';

const CALENDAR_EVENT = 'https://www.googleapis.com/auth/calendar.events';
const SCOPE_LIST = [
  CALENDAR_EVENT
];

function Permission({ scope }) {
  if (scope === CALENDAR_EVENT) {
    return (
      <Block display="flex" alignItems="center">
        Google Calendar Access <Block marginLeft="4px" /> <FaCalendarAlt />
      </Block>
    );
  }
  return null;
}

function Dashboard() {
  const { data, loading, error } = useQuery(GET_SCOPES_BY_AUTH);
  const [ formError, setFormError ] = useState(null);
  const [ updateGoogleRefreshToken, { loading: fetchingGoogleAuth } ] = useMutation(UPDATE_GOOGLE_REFRESH_TOKEN);
  if (loading || error) {
    return <Loading />;
  }

  const {
    getScopesByAuth
  } = data;

  const scopes = getScopesByAuth.filter((s) => SCOPE_LIST.find((l) => l === s));

  const successGoogle = async (response) => {
    if (response && response.code) {
      await updateGoogleRefreshToken({
        variables: {
          googleAuthCode: response.code
        },
        refetchQueries: ['GetScopesByAuth']
      }).catch(e => {
        setFormError(getErrorCode(e));
      });
    }
  };

  return (
    <Block
      display="flex"
      justifyContent="center"
      paddingLeft={["24px", "24px", "60px", "60px"]}
      paddingRight={["24px", "24px", "60px", "60px"]}
      paddingTop="60px"
      paddingBottom="60px"
    >
      <Block display="flex" flexDirection="column" width={['100%', '100%', '60%', '60%']}>
        <Display4><b>Permissions</b></Display4>
        <Block margin="6px" />
        <FormControl
          error={formError}
          positive=""
        >
          <GoogleLogin
            clientId={process.env.REACT_APP_G_AUTH_ID}
            onSuccess={successGoogle}
            buttonText="Grant Permissions with Google"
            onFailure={() => {}}
            responseType="code"
            accessType="offline"
            prompt="consent"
            scope="https://www.googleapis.com/auth/calendar.events"
            cookiePolicy={'single_host_origin'}
          />
        </FormControl>
        {
          scopes.map((scope) => {
            return <Permission key={scope} scope={scope} />;
          })
        }
      </Block>
    </Block>
  );
}

function MyPermissions() {
  const history = useHistory();
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);

  if (loading || error) {
    return <Loading />;
  }

  if (!data.getUserByAuth) {
    return (
      <Block display="flex" flexDirection="column" alignItems="center" margin="24px">
        <Label1><b>Join TeamBright and get access to the full booking experiences</b></Label1>
        <Block margin="24px">
          <PillButton
            onClick={() => {
              history.push(`/user/?from=user/permissions`);
            }}
          >
            Sign up for TeamBright
          </PillButton>
        </Block>
      </Block>
    );
  }

  return <Dashboard />;
}

export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[]} />
      <MyPermissions />
    </Block>
  );
};
