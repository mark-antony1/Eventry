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


export function TeamLineItem({ team, viewOnly }) {
  const client = useApolloClient();
  const [ confirming, setConfirming ] = useState(false);
  const [ quitTeam, { loading } ] = useMutation(QUIT_TEAM);
  const handleQuitTeam = async () => {
    const res = await quitTeam({
      variables: {
        teamId: team.id
      },
      refetchQueries: ['LoadUserProfile']
    }).catch(e => {});

    if (res) {
      showAlert(client, "Successfully quit");
    }
  };

  return (
    <Block display="flex">
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
        !confirming && !viewOnly && <PillButton size="compact" kind="minimal" onClick={() => setConfirming(true)}>Leave</PillButton>
      }
      {
        confirming && !viewOnly && <PillButton size="compact" loading={loading} onClick={handleQuitTeam}>Confirm Leave</PillButton>
      }
    </Block>
  );
}

function Dashboard() {
  const client = useApolloClient();
  const { data: userData, loading, error } = useQuery(LOAD_USER_PROFILE);
  const [ formError, setFormError ] = useState(null);
  const [ team, setTeam ] = useState(null);
  const [ joinTeam, { loading: joiningTeam } ] = useMutation(JOIN_TEAM);
  const [ getTeamsByEmail, { data: teamsData } ] = useLazyQuery(GET_TEAMS_BY_EMAIL);

  useEffect(() => {
    if (userData && userData.getUserByAuth) {
      getTeamsByEmail({ variables: { email: userData.getUserByAuth.user.email.split('@')[1] } });
    }
  }, [userData]);

  if (loading || error) {
    return null;
  }

  if (joiningTeam) {
    return <Loading message="Joining team..." />;
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
    <Block
      display="flex"
      justifyContent="center"
      paddingLeft={["24px", "24px", "60px", "60px"]}
      paddingRight={["24px", "24px", "60px", "60px"]}
      paddingTop="60px"
      paddingBottom="60px"
    >
      <Block display="flex" flexDirection="column" width={['100%', '100%', '60%', '60%']}>
        <Block display="flex" alignItems="center">
          <Display4><b>Manage Teams</b></Display4>
          <Block marginLeft="8px" />
          <PillButton size="compact" $as="a" href="/user/team/create">Create Team</PillButton>
        </Block>
        {
          teamsData &&
          <FormControl label="Join new team" error={formError} positive="">
            <Block display="flex">
              <Select
                options={
                  (teamsData.getTeamsByEmail || []).map((team, index) => {
                    return {
                      id: team.id,
                      label: team.name
                    };
                  })
                }
                value={team ? [team] : null}
                placeholder="search team by name"
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
        {
          teams.map((team) => {
            return <TeamLineItem key={team.id} team={team} />;
          })
        }
      </Block>
    </Block>
  );
}

function MyTeams() {
  const history = useHistory();
  const { data, loading, error } = useQuery(LOAD_USER_PROFILE);

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
              history.push(`/user/?from=user/team`);
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
      <MyTeams />
    </Block>
  );
};
