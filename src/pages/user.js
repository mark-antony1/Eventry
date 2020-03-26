import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { FaAngleRight } from 'react-icons/fa';
import { useDebounce, setCookie, getErrorCode, useQueryUrl } from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';
import {
  Display4,
  Label1
} from 'baseui/typography';
import {
  useQuery,
  useMutation,
  useLazyQuery
} from '@apollo/react-hooks';

import {
  GET_TEAMS_BY_EMAIL,
  LOAD_USER_PROFILE
} from '../constants/query';
import {
  CREATE_USER,
  SIGN_IN,
  CHANGE_PASSWORD
} from '../constants/mutation';

function SignUpForm({ handleSigninMode }) {
  const queryUrl = useQueryUrl();
  const history = useHistory();
  const [ createUser ] = useMutation(CREATE_USER);
  const [ getTeamsByEmail, { data: teamData } ] = useLazyQuery(GET_TEAMS_BY_EMAIL);
  const [ submittingForm, setSubmittingForm ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');
  const [ team, setTeam ] = useState(null);
  const [ signupError, setSignupError ] = useState(null);
  const debouncedEmail = useDebounce(email, 1500);

  useEffect(
    () => {
      if (debouncedEmail) {
        const emailDomain = debouncedEmail.split('@')[1];
        if (emailDomain) {
          getTeamsByEmail({
            variables: {
              email: emailDomain
            }
          });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedEmail]
  );

  const validateForm = () => {
    if (!email) {
      setSignupError('Company email is required');
      return false;
    }
    if (!team) {
      setSignupError('Team is required');
      return false;
    }
    if (!password) {
      setSignupError('Password is required');
      return false;
    }
    if (!firstName) {
      setSignupError('First name is required');
      return false;
    }
    if (!lastName) {
      setSignupError('Last name is required');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return null;
    }
    setSubmittingForm(true);
    createUser({
      variables: {
        email,
        firstName,
        lastName,
        password,
        team
      },
      refetchQueries: ({ data: { createUser: {token} } }) => {
        setCookie('userToken', token, 7);
        if (queryUrl.get('from')) {
          history.push(`/${queryUrl.get('from')}`);
        }
        return ['LoadUserProfile', 'GetUserByAuth'];
      }
    }).catch(error => {
      setSignupError(getErrorCode(error));
      setSubmittingForm(false);
    });
  };

  return (
    <Block
      display="flex"
      justifyContent="center"
      flexDirection="column"
      position="relative"
    >
      {submittingForm && <Loading compact={true} />}
      <Block display="flex" paddingBottom="24px" alignItems="flex-end">
        <Display4>Sign up</Display4>
        <Block
          overrides={{
            Block: {
              style: {
                cursor: 'pointer'
              }
            }
          }}
          marginLeft="12px"
          onClick={handleSigninMode}
        >
          <Label1 color="#777">I have an account <FaAngleRight style={{verticalAlign: 'middle'}} /></Label1>
        </Block>
      </Block>
      <FormControl
        error={signupError}
        positive=""
      >
        <Block>
          <FormControl label="Company Email" error={null} positive="">
            <Block>
              <Input
                value={email}
                placeholder="company email"
                type="text"
                onChange={e => {
                  setSignupError(null);
                  setEmail(e.currentTarget.value);
                }}
              />
            </Block>
          </FormControl>
          <FormControl label="Name" error={null} positive="">
            <Block display="flex">
              <Block flex="1">
                <Input
                  value={firstName}
                  type="text"
                  placeholder="first name"
                  onChange={e => {
                    setSignupError(null);
                    setFirstName(e.currentTarget.value);
                  }}
                />
              </Block>
              <Block flex="1">
                <Input
                  value={lastName}
                  type="text"
                  placeholder="last name"
                  onChange={e => {
                    setSignupError(null);
                    setLastName(e.currentTarget.value);
                  }}
                />
              </Block>
            </Block>
          </FormControl>
          <FormControl label="Team" error={null} positive="">
            <Block>
            {
              (teamData && teamData.getTeamsByEmail && !submittingForm) ?
              <Block>
                <Select
                  options={
                    teamData.getTeamsByEmail.map((team, index) => {
                      return {
                        id: index,
                        label: team.name
                      };
                    })
                  }
                  value={team ? [{
                    id: team,
                    label: team
                  }] : null}
                  placeholder="select or enter team name"
                  getValueLabel={({option}) => option.label}
                  onInputChange={e => {
                    setSignupError(null);
                    setTeam(e.currentTarget.value)
                  }}
                  onChange={params =>{
                    setSignupError(null);
                    if (params.value[0]) {
                      setTeam(params.value[0].label);
                    } else {
                      setTeam(null);
                    }

                  }}
                />
              </Block> :
              <Block>
                <Input
                  value={team ? team : ''}
                  type="text"
                  placeholder="enter team name"
                  onChange={e => {
                    setSignupError(null);
                    setTeam(e.currentTarget.value);
                  }}
                />
              </Block>
            }
            </Block>
          </FormControl>
          <FormControl label="Password" error={null} positive="">
            <Block>
              <Input
                value={password}
                type="password"
                placeholder="password"
                onChange={e => {
                  setSignupError(null);
                  setPassword(e.currentTarget.value);
                }}
              />
            </Block>
          </FormControl>
        </Block>
      </FormControl>
      <Button onClick={handleSignup}>Sign up</Button>
    </Block>
  );
}

function SignInForm({ handleSignupMode }) {
  const queryUrl = useQueryUrl();
  const history = useHistory();
  const [ signin ] = useMutation(SIGN_IN);
  const [ submittingForm, setSubmittingForm ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ signinError, setSigninError ] = useState(null);

  const validateForm = () => {
    if (!email) {
      setSigninError('Please enter company email');
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
    signin({
      variables: {
        email,
        password
      },
      refetchQueries: ({ data: { signin: {token} } }) => {
        setCookie('userToken', token, 7);
        if (queryUrl.get('from')) {
          history.push(`/${queryUrl.get('from')}`);
        }
        return ['LoadUserProfile', 'GetUserByAuth'];
      }
    }).catch(error => {
      setSigninError(getErrorCode(error));
      setSubmittingForm(false);
    });
  };

  return (
    <Block
      display="flex"
      justifyContent="center"
      flexDirection="column"
      position="relative"
    >
      {submittingForm && <Loading compact={true} />}
      <Block display="flex" paddingBottom="24px" alignItems="flex-end">
        <Display4>Sign in</Display4>
        <Block
          overrides={{
            Block: {
              style: {
                cursor: 'pointer'
              }
            }
          }}
          marginLeft="12px"
          onClick={handleSignupMode}
        >
          <Label1 color="#777">I want to sign up <FaAngleRight style={{verticalAlign: 'middle'}} /></Label1>
        </Block>
      </Block>
      <FormControl
        error={signinError}
        positive=""
      >
        <Block>
          <FormControl label="Company Email" error={null} positive="">
            <Block>
              <Input
                value={email}
                placeholder="company email"
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
                placeholder="password"
                onChange={e => {
                  setSigninError(null);
                  setPassword(e.currentTarget.value);
                }}
              />
            </Block>
          </FormControl>
        </Block>
      </FormControl>
      <Button onClick={handleSignin}>Sign in</Button>
    </Block>
  );
}


function Sign() {
  const [ showSignin, setShowSignin ] = useState(false);
  const [ showSignUp, setShowSignUp ] = useState(true);

  const handleSigninMode = () => {
    setShowSignin(true);
    setShowSignUp(false);
  };

  const handleSignupMode = () => {
    setShowSignin(false);
    setShowSignUp(true);
  };

  return (
    <Block
      display="flex"
      justifyContent="center"
      flexDirection={["column", "column", "row", "row"]}
      paddingTop="24px"
      paddingBottom="24px"
    >
      <Block width={['95%', '95%', '300px', '400px']} marginRight="24px">
        {
          showSignUp &&
          <Block display="flex" flexDirection="column">
            <SignUpForm handleSigninMode={handleSigninMode} />
          </Block>
        }
        {
          showSignin &&
          <Block display="flex" flexDirection="column">
            <Block display="flex" flexDirection="column">
              <SignInForm handleSignupMode={handleSignupMode} />
            </Block>
          </Block>
        }
      </Block>
    </Block>
  );
}

function WithLogin({ children }) {
  const { data, loading, error } = useQuery(LOAD_USER_PROFILE);

  if (loading || error) {
    return <Loading />;
  }

  if (!data.getUserByAuth) {
    return (
      <Sign />
    );
  }

  return (
    <>
      {children}
    </>
  );
}

function User() {
  const { data, loading, error, refetch } = useQuery(LOAD_USER_PROFILE);
  const [ changePassword ] = useMutation(CHANGE_PASSWORD);
  const [ changingPassword, setChangingPassword ] = useState(false);
  const [ changePasswordError, setChangePasswordError ] = useState(null);
  const [ currentPassword, setCurrentPassword ] = useState('');
  const [ newPassword, setNewPassword ] = useState('');

  const validateForm = () => {
    if (!currentPassword) {
      setChangePasswordError('Please enter current password');
      return false;
    }
    if (!newPassword) {
      setChangePasswordError('Please enter new password');
      return false;
    }
    return true;
  };
  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }
    const changePasswordResponse = await changePassword({
      variables: {
        currentPassword,
        newPassword
      }
    }).catch((error) => {
      setChangePasswordError(getErrorCode(error));
    });

    if (changePasswordResponse) {
      setChangingPassword(false);
    }
  };

  if (loading || error) {
    return <Loading />;
  }
  const {
    getUserByAuth: {
      user: {
        firstName,
        email
      }
    },
    getUserProfileByAuth: {
      company: {
        name: companyName
      },
      team: {
        name: teamName
      }
    }
  } = data;
  return (
    <Block
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingTop="24px"
      paddingBottom="46px"
    >
      <Block width={['95%', '95%', '300px', '400px']}>
        <Display4><b>Hello {firstName}!</b></Display4>
        <Display4 marginTop="12px"><b>{email}</b></Display4>
        <Display4 marginTop="12px"><b>{teamName} at {companyName}</b></Display4>
        {
          changingPassword &&
          <Block display="flex" marginTop="12px">
            <FormControl
              error={changePasswordError}
              positive=""
            >
              <Block>
                <FormControl label="Current password" error={null} positive="">
                  <Block>
                    <Input
                      value={currentPassword}
                      type="password"
                      placeholder="current password"
                      onChange={e => {
                        setChangePasswordError(null);
                        setCurrentPassword(e.currentTarget.value);
                      }}
                    />
                  </Block>
                </FormControl>
                <FormControl label="New password" error={null} positive="">
                  <Block>
                    <Input
                      value={newPassword}
                      type="password"
                      placeholder="new password"
                      onChange={e => {
                        setChangePasswordError(null);
                        setNewPassword(e.currentTarget.value);
                      }}
                    />
                  </Block>
                </FormControl>
              </Block>
            </FormControl>
          </Block>

        }
        <Block marginTop="12px">
          <Button onClick={() => {
            if (!changingPassword) {
              setChangingPassword(true);
            } else {
              handleChangePassword();
            }
          }}>
            Change password
          </Button>
        </Block>
        <Block marginTop="12px">
          <Button
            onClick={() => {
              setCookie('userToken', '', 7);
              refetch();
            }}
            kind="minimal"
          >
            Sign out
          </Button>
        </Block>
      </Block>
    </Block>
  );
}
export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[]} />
      <WithLogin>
        <User />
      </WithLogin>
    </Block>
  );
};
