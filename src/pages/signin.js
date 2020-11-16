import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import { useApolloClient } from '@apollo/react-hooks';
import {
  FaTrashAlt,
  FaHome,
  FaUserFriends,
  FaGoogle,
  FaPen,
  FaBirthdayCake
} from 'react-icons/fa';
import { Block } from 'baseui/block';
import { Card } from 'baseui/card';
import Button from '../components/button';
import { FormControl } from 'baseui/form-control';
import Input from '../components/input';
import { Tag } from 'baseui/tag';
import Select from '../components/select';
import { FaAngleRight } from 'react-icons/fa';
import { GoogleLogin } from 'react-google-login';
import {
  useDebounce,
  setCookie,
  getErrorCode,
  useQueryUrl,
  showAlert,
  getBackgroundColor
} from '../utils';
import CreateEventSelectTeamModal from '../components/team/create-event-team-select-modal';
import EventCell from '../components/team/event-cell';
import PillButton from '../components/pill-button';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';
import {
  Display2,
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

import { venues } from '../constants/locations';
import {
  GET_USER_BY_AUTH
} from '../constants/query';
import {
  SIGN_IN,
} from '../constants/mutation';

function SignInForm() {
  const client = useApolloClient();
  const queryUrl = useQueryUrl();
  const history = useHistory();
  const [ css ] = useStyletron();
  const [ signin ] = useMutation(SIGN_IN);
  const [ showSigninWithCompanyEmail, setShowSigninWithCompanyEmail ] = useState(false);
  const [ submittingForm, setSubmittingForm ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ googleTokenId, setGoogleTokenId ] = useState(null);
  const [ signinError, setSigninError ] = useState(null);

  const validateForm = () => {
    if (!email) {
      setSigninError('Please enter email');
      return false;
    }
    if (!password) {
      setSigninError('Please enter password');
      return false;
    }

    return true;
  };

  const handleSignin = async () => {
    if (!validateForm()) {
      return null;
    }
    setSubmittingForm(true);
    const signinSuccess = await signin({
      variables: {
        email,
        password
      },
      refetchQueries: ({ data: { signin: {token} } }) => {
        setCookie('userToken', token, 7);
        return ['GetUserByAuth'];
      }
    }).catch(error => {
      setSigninError(getErrorCode(error));
      setSubmittingForm(false);
    });

    if (signinSuccess) {
      showAlert(client, 'Welcome to Punchline')
    }
  };

  return (
    <Block
      display="flex"
      justifyContent="center"
      flexDirection="column"
      position="relative"
    >
      <Display4>Sign in</Display4>
      <Block margin="8px" />
      <FormControl
        error={signinError}
        positive=""
      >
        <Block>
          <FormControl label="Email" error={null} positive="">
            <Block>
              <Input
                value={email}
                placeholder="Email"
                type="text"
                onChange={e => {
                  setSigninError(null);
                  setEmail(e.currentTarget.value);
                }}
              />
            </Block>
          </FormControl>
          <FormControl label="Password" error={null} positive="">
            <Block>
              <Input
                value={password}
                type="password"
                placeholder="Password"
                onChange={e => {
                  setSigninError(null);
                  setPassword(e.currentTarget.value);
                }}
              />
            </Block>
          </FormControl>
        </Block>
      </FormControl>
      <Button onClick={handleSignin} loading={submittingForm}>Sign in</Button>
    </Block>
  );
}


function Sign() {

  return (
    <Block
      display="flex"
      alignItems="center"
      flexDirection="column"
      paddingTop="24px"
      paddingBottom="24px"
    >
      <Block width="80%">
        <Block display="flex" alignItems="center">
          <Block flex="1" display="flex" display={['none', 'none', 'initial', 'initial']} justifyContent="center">
            <Block marginTop="24px" marginBottom="24px">
              <Block width="20px" height="20px" backgroundColor="#4284F2" marginRight="12px" />
              <Display2><b>Cheers To</b></Display2>
              <Display2><b>Your</b></Display2>
              <Display2><b>Shiny Business</b></Display2>
              <Label1 marginTop="24px">We manage your Instagram</Label1>
              <Label1 marginTop="24px">Essential to do list for your Instagram & Yelp</Label1>
              <Label1 marginTop="24px">Droppin' QR Code promo on Instagram</Label1>
            </Block>
          </Block>
          <Block display="flex" flex="1" flexDirection="column" padding="36px">
            <SignInForm />
          </Block>
        </Block>
      </Block>
    </Block>
  );
}

function WithLogin({ children }) {
  const history = useHistory();
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);

  useEffect(() => {
    if (data && data.user) {
      history.push('/feed');
    }
  }, [data]);

  if (loading || error) {
    return <Loading />;
  }

  if (data && data.user) {
    return null;
  }

  return (
    <Sign />
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[]} />
      <WithLogin />
    </Block>
  );
};
