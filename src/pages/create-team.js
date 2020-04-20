import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Block } from 'baseui/block';
import Button from '../components/button';
import Input from '../components/input';
import { FormControl } from 'baseui/form-control';
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
  GET_USER_BY_AUTH
} from '../constants/query';
import {
  CREATE_TEAM
} from '../constants/mutation';
import {
  venues
} from '../constants/locations';
import { showAlert, getErrorCode } from '../utils';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

function CreateTeamForm() {
  const client = useApolloClient();
  const history = useHistory();
  const [ name, setName ] = useState('');
  const [ formError, setFormError ] = useState(null);
  const [ createTeam, { loading: creatingTeam } ] = useMutation(CREATE_TEAM);
  const { loading, error } = useQuery(GET_USER_BY_AUTH);

  if (loading || error) {
    return <Loading />;
  }

  if (creatingTeam) {
    return <Loading message="Creating team..." />;
  }

  const validateForm = () => {
    if (!name) {
      setFormError('Team name is required');
      return false;
    }
    return true;
  };

  const handleCreateTeam = async () => {
    if (!validateForm()) {
      return;
    }
    const res = await createTeam({
      variables: {
        name,
        lowercaseName: name.toLowerCase()
      }
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res && res.data && res.data.createTeam) {
      showAlert(client, 'Team successfully created!');
      history.push(`/team/${res.data.createTeam}`);
    }
  };

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
        <Display4><b>Create Team</b></Display4>
        <FormControl label="" positive="" error={formError}>
          <Block>
            <FormControl label="Team Name" positive="" error={null}>
              <Block display="flex">
                <Input
                  placeholder="name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </Block>
            </FormControl>
          </Block>
        </FormControl>
        <Button onClick={handleCreateTeam}>Create Team</Button>
      </Block>
    </Block>
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column" height="100vh">
      <HeaderNavigation leftButtons={[]} />
      <Block>
        <CreateTeamForm />
      </Block>
    </Block>
  );
}
