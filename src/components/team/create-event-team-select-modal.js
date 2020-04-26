import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'baseui/modal';
import { Block } from 'baseui/block';
import { FormControl } from 'baseui/form-control';
import {
  useQuery,
} from '@apollo/react-hooks';
import {
  GET_USER_BY_AUTH
} from '../../constants/query';

import { TeamLineItem } from '../../pages/manage-team';

export default ({ showModal, close }) => {
  const history = useHistory();
  const { data: userData, loading, error } = useQuery(GET_USER_BY_AUTH);

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

  return (
    <Modal onClose={close} isOpen={showModal}>
      <ModalHeader>Create New Event</ModalHeader>
      <ModalBody>
        <FormControl
          error={null}
          label="Choose team"
          positive=""
        >
        <Block>
          {
            teams.map((team) => {
              return (
                <Block
                  key={team.id}
                  overrides={{
                    Block: {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  }}
                  onClick={() => {
                    history.push(`/team/${team.id}/create-event`);
                  }}
                >
                  <TeamLineItem team={team} viewOnly={true} />
                </Block>
              );
            })
          }
        </Block>
        </FormControl>
      </ModalBody>
    </Modal>
  );
}
