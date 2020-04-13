import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/react-hooks';
import {
  FaTrashAlt,
  FaHome,
  FaUserFriends
} from 'react-icons/fa';
import { Block } from 'baseui/block';
import { Card } from 'baseui/card';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Tag } from 'baseui/tag';
import { Select } from 'baseui/select';
import { FaAngleRight } from 'react-icons/fa';
import {
  useDebounce,
  setCookie,
  getErrorCode,
  useQueryUrl,
  showAlert
} from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';
import {
  Display4,
  Paragraph1,
  Label1
} from 'baseui/typography';
import {
  useQuery,
  useMutation,
  useLazyQuery
} from '@apollo/react-hooks';

import { venues } from '../constants/locations';
import {
  GET_TEAMS_BY_EMAIL,
  LOAD_USER_PROFILE,
  GET_REVIEWS_BY_AUTH,
  GET_COMPANY_EMAILS_AND_VALIDATE_TEAM
} from '../constants/query';
import {
  CREATE_USER,
  SIGN_IN,
  CHANGE_PASSWORD,
  DELETE_ENDORSEMENT
} from '../constants/mutation';

function MyReview({ review }) {
  const client = useApolloClient();
  const [ confirmingDelete, setConfirmingDelete ] = useState(false);
  const [ deleteEndorsement, { loading: deletingEndorsement } ] = useMutation(DELETE_ENDORSEMENT);

  const handleDeleteEndorsement = async () => {
    const deleteEndorsementResponse = await deleteEndorsement({
      variables: {
        reviewId: review.id
      },
      refetchQueries: ['GetReviewsByAuth']
    }).catch(() => {});

    if (deleteEndorsementResponse) {
      showAlert(client, 'Successfully deleted the endorsement');
      setConfirmingDelete(false);
    }
  };

  const venue = venues.find(v => v.symbol === review.symbol) || {};

  return (
    <Block marginTop="12px" position="relative">
      {deletingEndorsement && <Loading compact={true} />}
      <Card>
        <Paragraph1>
          {review.content}
        </Paragraph1>
        <Label1><b>At <a href={`/${review.symbol}`} target="_blank" rel="noopener noreferrer">{venue.name}</a></b></Label1>
        <Block display="flex" justifyContent="flex-end" marginTop="8px">
          {
            confirmingDelete ?
            <Button onClick={handleDeleteEndorsement}>Delete Endorsement</Button>
            :
            <Button kind="minimal" onClick={() => setConfirmingDelete(true)}><FaTrashAlt /></Button>
          }

        </Block>
      </Card>
    </Block>
  );
}

function MyReviews() {
  const { data, loading, error } = useQuery(GET_REVIEWS_BY_AUTH);

  if (loading || error) {
    return <Loading />;
  }

  const {
    getReviewsByAuth: reviews
  } = data;

  return (
    <Block>
      <Display4><b>My Endorsements</b></Display4>
      <Block>
        {!reviews.length && <Label1><b>You haven't endorsed any venue yet</b></Label1>}
        {
          reviews.map((review, index) => {
            return <MyReview key={index} review={review} />;
          })
        }
      </Block>
    </Block>
  );
}

function SignUpForm({ handleSigninMode }) {
  const client = useApolloClient();
  const queryUrl = useQueryUrl();
  const history = useHistory();
  const [ createUser ] = useMutation(CREATE_USER);
  const [ getCompanyEmailsAndValidateTeam, { data: teamInviteValidationData, loading: teamInviteValidating } ] = useLazyQuery(GET_COMPANY_EMAILS_AND_VALIDATE_TEAM);
  const [ getTeamsByEmail, { data: teamData } ] = useLazyQuery(GET_TEAMS_BY_EMAIL);
  const [ submittingForm, setSubmittingForm ] = useState(false);
  const [ emailVerified, setEmailVerified ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');
  const [ team, setTeam ] = useState(null);
  const [ signupError, setSignupError ] = useState(null);
  const debouncedEmail = useDebounce(email, 1500);

  // team invite
  const invitedEmail = queryUrl.get('invitedEmail');
  const invitedTeam = queryUrl.get('invitedTeam');
  const invitedCompanyId = queryUrl.get('invitedCompanyId');
  const isTeamInvitedMode = invitedTeam && invitedCompanyId && invitedEmail;

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

  useEffect(
    () => {
      // if team invite validated
      if (teamInviteValidationData) {
        const {
          getCompanyEmailsAndValidateTeam: {
            teamFound,
            emails
          }
        } = teamInviteValidationData;
        if (teamFound) {
          const correctEmail = emails.reduce((res, email) => {
            if (String(invitedEmail.split('@')[1]).toLowerCase() === email.toLowerCase()) {
              return true;
            }
            return res;
          }, false);
          if (correctEmail) {
            setEmailVerified(true);
            setTeam(invitedTeam);
            setEmail(invitedEmail);
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teamInviteValidationData]
  );

  useEffect(
    () => {
      // if team invite mode
      if (isTeamInvitedMode) {
        getCompanyEmailsAndValidateTeam({
          variables: {
            teamName: invitedTeam,
            companyId: invitedCompanyId
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTeamInvitedMode]
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
    const createUserSuccess = await createUser({
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

    if (createUserSuccess) {
      showAlert(client, 'Welcome to TeamBright!')
    }
  };

  const renderEmailInput = () => {
    if (teamInviteValidating) {
      return <Loading compact={true} />;
    }

    if (teamInviteValidationData) {
      const {
        getCompanyEmailsAndValidateTeam: {
          teamFound
        }
      } = teamInviteValidationData;
      if (teamFound && emailVerified) {
        return (
          <Block>
            <Label1><b>{invitedEmail}</b> <Tag closeable={false} variant="outlined" kind="positive">Email verified</Tag></Label1>
          </Block>
        );
      }
    }
    return (
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
    );
  };

  const renderTeamInput = () => {
    if (teamInviteValidating) {
      return <Loading compact={true} />;
    }

    if (teamInviteValidationData) {
      const {
        getCompanyEmailsAndValidateTeam: {
          teamFound
        }
      } = teamInviteValidationData;
      if (teamFound && emailVerified) {
        return (
          <Block>
            <Label1><b>{invitedTeam}</b></Label1>
          </Block>
        );
      }
    }
    if (teamData && teamData.getTeamsByEmail && !submittingForm) {
      return (
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
        </Block>
      );
    }

    return (
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
    );
  };

  return (
    <Block
      display="flex"
      justifyContent="center"
      flexDirection="column"
      position="relative"
    >
      {submittingForm && <Loading compact={true} message="Signing You Up" />}
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
            {renderEmailInput()}
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
              {renderTeamInput()}
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
  const client = useApolloClient();
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
    const signinSuccess = await signin({
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

    if (signinSuccess) {
      showAlert(client, 'Welcome to TeamBright!')
    }
  };

  return (
    <Block
      display="flex"
      justifyContent="center"
      flexDirection="column"
      position="relative"
    >
      {submittingForm && <Loading compact={true} message="Logging You In" />}
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
  const queryUrl = useQueryUrl();
  const [ showSignin, setShowSignin ] = useState(queryUrl.get('p') !== 'signup');
  const [ showSignUp, setShowSignUp ] = useState(queryUrl.get('p') === 'signup');

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
  const client = useApolloClient();
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
      showAlert(client, 'Successfully changed the password');
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
        name: companyName,
        logo: companyLogo
      },
      teams
    }
  } = data;
  return (
    <Block
      display="flex"
      flexDirection="column"
      paddingLeft={["24px", "24px", "60px", "60px"]}
      paddingRight={["24px", "24px", "60px", "60px"]}
      paddingTop="60px"
      paddingBottom="60px"
    >
      <Block>
        <Block display="flex">
          <Display4><b>Hello {firstName}!</b></Display4>
          <Block flex="1" display="flex" alignItems="center" justifyContent="flex-end">
            {companyLogo && <img alt="review-logo" height="50px" src={companyLogo} />}
          </Block>
        </Block>
        <Block marginTop="12px" marginBottom="24px" display="flex" alignItems="center">
          <Label1><b>{email}</b></Label1>
          <Block marginLeft="12px">
            <Button size="compact" kind="minimal" onClick={() => setChangingPassword(!changingPassword)}>
              Change password
            </Button>
          </Block>
          <Block marginLeft="12px">
            <Button size="compact" kind="secondary" onClick={() => {
              setCookie('userToken', '', 7);
              refetch();
              showAlert(client, 'See you next time!');
            }}>
              Sign out
            </Button>
          </Block>
        </Block>
        {
          changingPassword &&
          <Block display="flex" flexDirection="column" marginTop="12px" marginBottom="12px" backgroundColor="#f7f7f7" padding="12px">
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
            <Button onClick={handleChangePassword}>
              Confirm
            </Button>
          </Block>
        }
        <Block display="flex">
          <Block flex="1">
            <FaHome />
            <Label1><b>Company</b></Label1>
            <Label1>{companyName}</Label1>
          </Block>
          <Block flex="1">
            <FaUserFriends />
            <Label1><b>Teams</b></Label1>
            {
              teams.map((team) => {
                return <Label1 key={team.id}>{team.name}</Label1>
              })
            }
          </Block>
        </Block>
        <Block backgroundColor="#777" height="1px" width="100%" marginTop="24px" marginBottom="24px" />
        <Block>
          <MyReviews />
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
