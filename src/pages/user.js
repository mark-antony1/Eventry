import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import { useApolloClient } from '@apollo/react-hooks';
import {
  FaTrashAlt,
  FaHome,
  FaUserFriends,
  FaGoogle,
  FaPen
} from 'react-icons/fa';
import {
  Modal,
  ModalHeader,
  ModalBody,
} from 'baseui/modal';
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
  showAlert
} from '../utils';
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
  DELETE_ENDORSEMENT,
  JOIN_TEAM,
  QUIT_TEAM
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
            <PillButton onClick={handleDeleteEndorsement}>Delete Endorsement</PillButton>
            :
            <PillButton kind="minimal" onClick={() => setConfirmingDelete(true)}><FaTrashAlt /></PillButton>
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

function SignUpForm({ handleSigninMode, googleEmailInfo }) {
  const client = useApolloClient();
  const queryUrl = useQueryUrl();
  const history = useHistory();
  const [ createUser ] = useMutation(CREATE_USER);
  const [ getCompanyEmailsAndValidateTeam, { data: teamInviteValidationData, loading: teamInviteValidating } ] = useLazyQuery(GET_COMPANY_EMAILS_AND_VALIDATE_TEAM);
  const [ getTeamsByEmail, { data: teamData } ] = useLazyQuery(GET_TEAMS_BY_EMAIL);
  const [ submittingForm, setSubmittingForm ] = useState(false);
  const [ emailVerified, setEmailVerified ] = useState(false);
  const [ email, setEmail ] = useState((googleEmailInfo && googleEmailInfo.email) ? googleEmailInfo.email : '');
  const [ password, setPassword ] = useState('');
  const [ firstName, setFirstName ] = useState((googleEmailInfo && googleEmailInfo.firstName) ? googleEmailInfo.firstName : '');
  const [ lastName, setLastName ] = useState((googleEmailInfo && googleEmailInfo.lastName) ? googleEmailInfo.lastName : '');
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
    if (!password && (!googleEmailInfo || !googleEmailInfo.googleTokenId)) {
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
        team,
        googleTokenId: googleEmailInfo ? googleEmailInfo.googleTokenId : null
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

    // signup via google
    if (googleEmailInfo && googleEmailInfo.email) {
      return (
        <Block>
          <Label1><b>{email}</b> <Tag closeable={false} variant="outlined" kind="positive">Email verified</Tag></Label1>
        </Block>
      );
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

  const renderNameInput = () => {
    return (
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

  const renderPasswordInput = () => {
    if (googleEmailInfo) {
      return null;
    }
    return (
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
            {renderNameInput()}
          </FormControl>
          <FormControl label="Team" error={null} positive="">
            <Block>
              {renderTeamInput()}
            </Block>
          </FormControl>
          {renderPasswordInput()}
        </Block>
      </FormControl>
      <Button onClick={handleSignup}>Sign up</Button>
    </Block>
  );
}

function SignUpMethod({ handleSigninMode }) {
  const [ css ] = useStyletron();
  const [ showSignUpForm, setShowSignUpForm ] = useState(false);
  const [ googleEmailInfo, setGoogleEmailInfo ] = useState(null);

  const successGoogle = (response) => {
    if (response && response.profileObj) {
      const {
        email,
        givenName,
        familyName
      } = response.profileObj;
      const {
        tokenId
      } = response;
      setGoogleEmailInfo({
        email,
        firstName: givenName,
        lastName: familyName,
        googleTokenId: tokenId
      });
      setShowSignUpForm(true);
    }
  }

  if (showSignUpForm) {
    return (
      <SignUpForm handleSigninMode={handleSigninMode} googleEmailInfo={googleEmailInfo} />
    );
  }

  return (
    <Block
      display="flex"
      flexDirection="column"
      position="relative"
    >
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
      <GoogleLogin
        clientId={process.env.REACT_APP_G_AUTH_ID}
        onSuccess={successGoogle}
        buttonText="Sign up with Google"
        onFailure={() => {}}
        cookiePolicy={'single_host_origin'}
      />
      <Block margin="8px" />
      <Button kind="secondary" onClick={() => setShowSignUpForm(true)}>Sign up with Company Email</Button>
    </Block>
  );
}

function SignInForm({ handleSignupMode }) {
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

  useEffect(() => {
    if (googleTokenId) {
      handleSignin();
    }
  }, [googleTokenId]);

  const validateForm = () => {
    if (!email) {
      setSigninError('Please enter company email');
      return false;
    }
    if (!password && !googleTokenId) {
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
        password,
        googleTokenId
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

  const successGoogle = (response) => {
    if (response && response.profileObj) {
      const {
        email,
      } = response.profileObj;
      const {
        tokenId
      } = response;
      setEmail(email);
      setGoogleTokenId(tokenId);
    }
  }

  if (showSigninWithCompanyEmail) {
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
      <FormControl label="" error={signinError} positive="">
        <Block display="flex" flexDirection="column">
          <GoogleLogin
            clientId={process.env.REACT_APP_G_AUTH_ID}
            onSuccess={successGoogle}
            onFailure={() => {}}
            buttonText="Sign in with Google"
            cookiePolicy={'single_host_origin'}
          />
          <Block margin="8px" />
          <Button kind="secondary" onClick={() => setShowSigninWithCompanyEmail(true)}>Sign in with Company Email</Button>
        </Block>
      </FormControl>
    </Block>
  );
}


function Sign() {
  const queryUrl = useQueryUrl();
  const [ showSignin, setShowSignin ] = useState(queryUrl.get('p') !== 'signup');
  const [ showSignUp, setShowSignUp ] = useState(queryUrl.get('p') === 'signup');
  const hasRedirect = Boolean(queryUrl.get('from'));
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
      alignItems="center"
      flexDirection="column"
      paddingTop="24px"
      paddingBottom="24px"
    >
      {
        hasRedirect &&
        <Block width={['95%', '95%', '500px', '400px']} display="flex" flexDirection="column" alignItems="center" backgroundColor="#f7f7f7" padding="12px" marginBottom="24px">
          <Tag closeable={false} variant="outlined" kind="positive">Sign In Required!</Tag>
          <Label3>
            Sign in to unlock full TeamBright experience
          </Label3>
        </Block>
      }
      <Block width={['95%', '95%', '500px', '400px']}>
        {
          showSignUp &&
          <Block display="flex" flexDirection="column">
            <SignUpMethod handleSigninMode={handleSigninMode} />
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

function TeamLineItem({ team }) {
  const [ confirming, setConfirming ] = useState(false);
  const [ quitTeam, { loading } ] = useMutation(QUIT_TEAM);
  const handleQuitTeam = async () => {
    await quitTeam({
      variables: {
        teamId: team.id
      },
      refetchQueries: ['LoadUserProfile']
    }).catch(e => {});
  };

  return (
    <Block display="flex">
      {loading && <Loading compact={true} />}
      <Block
        flex="1"
        backgroundColor={getBackgroundColor()}
        padding="8px"
        marginTop="8px"
        overrides={{
          Block: {
            style: {
              borderRadius: '500px'
            }
          }
        }}
      >
        <Label3 color="#fff"><b>{team.name}</b></Label3>
      </Block>
      {
        !confirming && <PillButton size="compact" kind="minimal" onClick={() => setConfirming(true)}>Quit</PillButton>
      }
      {
        confirming && <PillButton size="compact" onClick={handleQuitTeam}>Quit Confirm</PillButton>
      }
    </Block>
  );
}

function TeamsForm({ close, showForm }) {
  const client = useApolloClient();
  const { data: userData, loading, error } = useQuery(LOAD_USER_PROFILE);
  const [ formError, setFormError ] = useState(null);
  const [ team, setTeam ] = useState(null);
  const [ joinTeam ] = useMutation(JOIN_TEAM);
  const [ getTeamsByEmail, { data: teamsData } ] = useLazyQuery(GET_TEAMS_BY_EMAIL);

  useEffect(() => {
    if (userData && userData.getUserByAuth) {
      getTeamsByEmail({ variables: { email: userData.getUserByAuth.user.email.split('@')[1] } });
    }
  }, [userData]);

  if (loading || error) {
    return null;
  }

  const {
    getUserByAuth: {
      user: {
        teams
      }
    }
  } = userData;

  const handleJoinTeam = async () => {
    const res = await joinTeam({
      variables: {
        teamId: team.id
      },
      refetchQueries: ['LoadUserProfile']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res) {
      showAlert(client, "Team successfully added");
    }
  };
  return (
    <Modal onClose={close} isOpen={showForm}>
      <ModalHeader>My Teams</ModalHeader>
      <ModalBody>
        {
          teams.map((team) => {
            return <TeamLineItem key={team.id} team={team} />;
          })
        }
        {
          teamsData &&
          <FormControl label="Join new team" error={formError} positive="">
            <Block display="flex">
              <Select
                options={
                  teamsData.getTeamsByEmail.map((team, index) => {
                    return {
                      id: team.id,
                      label: team.name
                    };
                  })
                }
                value={team ? [team] : null}
                placeholder="select team"
                searchable={true}
                getValueLabel={({option}) => option.label}
                onChange={params =>{
                  if (params.value[0]) {
                    setTeam(params.value[0]);
                  } else {
                    setTeam(null);
                  }
                }}
              />
              <Block marginLeft="6px">
                <PillButton disabled={!team} onClick={handleJoinTeam}>Join</PillButton>
              </Block>
            </Block>
          </FormControl>
        }
      </ModalBody>
    </Modal>
  );
};
function getBackgroundColor() {
  const x = Math.floor(Math.random() * 256);
  const y = Math.floor(Math.random() * 256);
  const z = Math.floor(Math.random() * 180);
  const bgColor = "rgb(" + x + "," + y + "," + z + ")";
  return bgColor;
}

function TeamCell({ team }) {
  return (
    <Block backgroundColor={getBackgroundColor()} padding="12px" display="flex" marginTop="12px" alignItems="center" overrides={{ Block: { style: { borderRadius: '500px'}}}}>
      <Label3 color="#fff"><b>{team.name}</b></Label3>
      <Block marginLeft="12px">
        <Label3 $as="a" href={`/team/${team.id}`} color="#fff">See upcoming events</Label3>
      </Block>
    </Block>
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
  const [ editingTeams, setEditingTeams ] = useState(false);

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
            {companyLogo && <img alt="review-logo" height="50px" src={companyLogo} style={{borderRadius: '10px'}}/>}
          </Block>
        </Block>
        <Block marginTop="12px" marginBottom="24px" display="flex" alignItems="center">
          <Label1><b>{email}</b></Label1>
          <Block marginLeft="12px">
            <PillButton size="compact" kind="minimal" onClick={() => setChangingPassword(!changingPassword)}>
              Change password
            </PillButton>
          </Block>
          <Block marginLeft="12px">
            <PillButton size="compact" kind="secondary" onClick={() => {
              setCookie('userToken', '', 7);
              refetch();
              showAlert(client, 'See you next time!');
            }}>
              Sign out
            </PillButton>
          </Block>
        </Block>
        {
          changingPassword &&
          <Block display="flex" width="fit-content" flexDirection="column" marginTop="12px" marginBottom="12px" backgroundColor="#f7f7f7" padding="12px">
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
            <Block display="flex" alignItems="center">
              <Label1><b>My Teams</b></Label1>
              <Block marginLeft="4px">
                <Button size="compact" kind="minimal" onClick={() => setEditingTeams(true)}><FaPen /></Button>
              </Block>
            </Block>
            {
              teams.map((team) => {
                return <TeamCell key={team.id} team={team} />;
              })
            }
          </Block>
        </Block>
        <Block backgroundColor="#777" height="1px" width="100%" marginTop="24px" marginBottom="24px" />
        <Block>
          <MyReviews />
        </Block>
      </Block>
      <TeamsForm showForm={editingTeams} close={() => setEditingTeams(false)} />
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
