import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaUser,
  FaPen,
  FaTrashAlt
} from 'react-icons/fa';
import moment from 'moment-timezone';
import Plus from 'baseui/icon/plus';
import { useStyletron } from 'styletron-react';
import { Tag } from 'baseui/tag';
import { Select } from 'baseui/select';
import { Button } from 'baseui/button';
import { Datepicker } from 'baseui/datepicker';
import { TimePicker } from 'baseui/timepicker';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { StatefulTooltip } from 'baseui/tooltip';
import { Block } from 'baseui/block';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import {
  Display4,
  Label1,
  Label2,
  Label3,
} from 'baseui/typography';
import {
  useQuery,
  useMutation,
  useApolloClient
} from '@apollo/react-hooks';
import {
  GET_USER_BY_AUTH
} from '../../constants/query';
import {
  VOTE_POLL_LINEITEM,
  REMOVE_POLL_LINEITEM,
  UNDO_VOTE_POLL_LINEITEM,
  ADD_POLL_LINEITEM,
  UPDATE_POLL
} from '../../constants/mutation';

import { showAlert, getErrorCode } from '../../utils';
import { venues as allVenues } from '../../constants/locations';
import { venues as allVirtualVenues } from '../../constants/virtual-locations';
import Loading from '../../components/loading';

function getHasUserVoted(userId, pollLineItems) {
  return pollLineItems.reduce((agg, item) => {
    if (item.voters.find(v => v.id === userId)) {
      return true;
    }
    return agg;
  }, false);
}

const allLocations = [ ...allVenues, ...allVirtualVenues ];

const getLabel = ({option}) => {
  return (
    <Block>
      <Label2>{option.label}</Label2>
      <Label3>{option.teaserDescription}</Label3>
    </Block>
  );
};

function VenueNameSearchBar({ updateForm, form }) {
  const [ searchKey, setSearchKey ] = useState('');
  const searchResults = allLocations.filter((loc) => {
    return loc.name.toLowerCase().includes(searchKey.toLowerCase());
  }).slice(0, 3);

  return (
    <Select
      options={searchResults.map(result => ({
        label: result.name,
        id: result.symbol,
        teaserDescription: result.teaserDescription
      }))}
      placeholder="Search venue by name"
      onInputChange={(event) => setSearchKey(event.target.value)}
      value={form.venue ? [form.venue] : null}
      onChange={params => updateForm({ venue: params.value[0] })}
      getOptionLabel={getLabel}
    />
  );
}

function RemovePollLineItemForm({ name, pollLineItemId, showForm, close }) {
  const client = useApolloClient();
  const [ formError, setFormError ] = useState(null);
  const [ removePollLineItem, { loading: removingPollLineItem } ] = useMutation(REMOVE_POLL_LINEITEM);

  const handleRemovePollLineItem = async () => {
    const res = await removePollLineItem({
      variables: {
        pollLineItemId
      },
      refetchQueries: ['GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res) {
      showAlert(client, 'Successfully removed item!');
      close();
    }
  };
  return (
    <Modal onClose={close} isOpen={showForm}>
      {removingPollLineItem && <Loading compact={true} message="Removing item..." />}
      <ModalHeader>Remove Poll Item</ModalHeader>
      <ModalBody>
        <Label1>Remove {name}?</Label1>
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={handleRemovePollLineItem}>Remove</ModalButton>
      </ModalFooter>
    </Modal>
  );
}

function PollLineItem({ item, handleSelectLineItem, selectedPollLineItemId }) {
  const { data: {
    getUserByAuth: {
      user: {
        id: userId
      }
    }
  } } = useQuery(GET_USER_BY_AUTH);
  const [ css ] = useStyletron();
  const [ removingPollLineItem, setRemovingPollLineItem ] = useState(false);
  const [ showVoters, setShowVoters ] = useState(false);

  const userVoted = item.voters.find(v => v.id === userId);
  return (
    <Block display="flex" alignItems="center">
      <Block
        flex="1"
        backgroundColor={(userVoted || selectedPollLineItemId === item.id) ? "#77BA01" : "#ddd"}
        padding="12px"
        marginTop="4px"
        display="flex"
        alignItems="center"
        className={css({
          cursor: 'pointer',
          ':hover': {
            backgroundColor: "#77BA01"
          }
        })}
        onClick={() => handleSelectLineItem(item.id)}
      >
        <Label1><b>{item.name}</b> {item.symbol && <Label3 $as="a" href={`/${item.symbol}`} target="_blank">Details</Label3>}</Label1>
        <Block display="flex" flex="1" justifyContent="flex-end" alignItems="center">
          <StatefulTooltip
            content={() => {
              if (!item.voters.length) {
                return null;
              }
              return (
                <Block padding={"20px"}>
                  {
                    item.voters.map((v) => {
                      return (
                        <Block key={v.id}>
                          <Label1 color="#fff">{v.firstName}</Label1>
                        </Block>
                      );
                    })
                  }
                </Block>
              );
            }}
          >
            <Block display="flex" alignItems="center">
              <FaUser size={12} /> <Label1 marginLeft="12px"><b>{item.voters.length}</b></Label1>
            </Block>
          </StatefulTooltip>
        </Block>
      </Block>
      <Block marginLeft="8px">
        <Button onClick={() => setRemovingPollLineItem(true)} size="compact" kind="minimal"><FaTrashAlt /></Button>
      </Block>
      <RemovePollLineItemForm name={item.name} pollLineItemId={item.id} close={() => setRemovingPollLineItem(false)} showForm={removingPollLineItem} />
    </Block>
  );
}

function PollForm({ poll, showForm, close }) {
  const client = useApolloClient();
  const [ form, setForm ] = useState({
    name: poll.name,
    expiration: new Date(poll.expiration)
  });

  const [ formError, setFormError ] = useState(null);
  const [ updatePoll, { loading: updatingPoll } ] = useMutation(UPDATE_POLL);
  const validateForm = () => {
    if (!form.expiration) {
      setFormError('Expiration is required');
      return false;
    }

    return true;
  };
  const updateForm = (payload) => {
    setForm({
      ...form,
      ...payload
    });
  };
  const handleAddPollLineItem = async () => {
    if (!validateForm()) {
      return;
    }

    const res = await updatePoll({
      variables: {
        pollId: poll.id,
        expiration: form.expiration,
        name: form.name
      },
      refetchQueries: ['GetTeamPolls', 'GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res) {
      showAlert(client, 'Successfully updated poll');
      close();
    }
  };
  return (
    <Modal onClose={close} isOpen={showForm}>
      {updatingPoll && <Loading compact={true} message="Save poll..." />}
      <ModalHeader>Edit Poll</ModalHeader>
      <ModalBody>
        <FormControl error={null} label="Name" positive="" caption="ex) 4th Street Bar">
          <Input
            value={form.name}
            onChange={e => {
              updateForm({
                name: e.currentTarget.value
              });
            }}
          />
        </FormControl>
        {
          !updatingPoll &&
          <FormControl label="Poll Closing Time" caption="YYYY/MM/DD HH:MM" positive="" error={null}>
            <Block display="flex">
              <Datepicker
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
        }
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={handleAddPollLineItem}>Save</ModalButton>
      </ModalFooter>
    </Modal>
  );
}

function PollLineItemForm({ pollId, showForm, close }) {
  const client = useApolloClient();
  const [ form, setForm ] = useState({
    name: '',
    venue: null
  });
    const [ formError, setFormError ] = useState(null);
  const [ addPollLineItem, { loading: creatingPollLineItem } ] = useMutation(ADD_POLL_LINEITEM);
  const validateForm = () => {
    if (!form.name) {
      setFormError('Item name is required');
      return false;
    }

    return true;
  };
  const updateForm = (payload) => {
    setForm({
      ...form,
      ...payload
    });
  };
  const handleAddPollLineItem = async () => {
    if (!validateForm()) {
      return;
    }

    const res = await addPollLineItem({
      variables: {
        pollId,
        symbol: form.venue ? form.venue.id : null,
        name: form.name
      },
      refetchQueries: ['GetTeamPolls', 'GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });
    if (res) {
      showAlert(client, `Successfully added ${form.name}`);
      setForm({
        name: '',
        venue: null
      });
      close();
    }
  };

  return (
    <Modal onClose={close} isOpen={showForm}>
      {creatingPollLineItem && <Loading compact={true} message="Adding poll item..." />}
      <ModalHeader>Add Poll Item</ModalHeader>
      <ModalBody>
        <FormControl error={null} label="Name" positive="" caption="ex) 4th Street Bar">
          <Input
            value={form.name}
            onChange={e => {
              updateForm({
                name: e.currentTarget.value
              });
            }}
          />
        </FormControl>
        <Block>
          {!creatingPollLineItem &&
            <FormControl error={null} label="Link to a venue (optional)" positive="" caption="Discover venue below!">
              <VenueNameSearchBar updateForm={updateForm} form={form} />
            </FormControl>
          }
        </Block>
        <FormControl error={formError} label="Discover venues" positive="">
          <Block display="flex" flexDirection="column" justifyContent="center">
            <Button kind="secondary" $as="a" target="_blank" href="/v">
              <Tag closeable={false} variant="outlined" kind="negative">New</Tag> Discover virtual events
            </Button>
            <Block margin="4px" />
            <Button target="_blank" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900', height: '34px'}}}} $as="a" href="/s">
              Discover venues in San Francisco
            </Button>
          </Block>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={handleAddPollLineItem}>Add</ModalButton>
      </ModalFooter>
    </Modal>
  );
}

export default ({ poll }) => {
  const client = useApolloClient();
  const [ addingPollLineItem, setAddingPollLineItem ] = useState(false);
  const [ editingPoll, setEditingPoll ] = useState(false);
  const { data, loading: userLoading } = useQuery(GET_USER_BY_AUTH);
  const [ votePollLineItem, { loading: voting } ] = useMutation(VOTE_POLL_LINEITEM);
  const [ unvotePollLineItem, { loading: unvoting } ] = useMutation(UNDO_VOTE_POLL_LINEITEM);
  const [ selectedPollLineItemId, setSelectedPollLineItemId ] = useState(null);
  const {
    name,
    pollLineItems,
    id: pollId
  } = poll;

  if (userLoading) {
    return null;
  }

  const {
    getUserByAuth: {
      user: {
        id: userId
      }
    }
  } = data;

  const handleSelectLineItem = (id) => {
    setSelectedPollLineItemId(id);
  };

  const handleVoteLineItem = async () => {
    const res = await votePollLineItem({
      variables: {
        pollLineItemId: selectedPollLineItemId
      },
      refetchQueries: ['GetTeamPolls', 'GetEvent']
    }).catch((e) => {

    });

    if (res) {
      showAlert(client, 'Successfully voted');
    }
  };

  const handleUnvoteLineItem = async () => {
    const res = await unvotePollLineItem({
      variables: {
        pollId: poll.id
      },
      refetchQueries: ['GetTeamPolls', 'GetEvent']
    }).catch((e) => {

    });

    if (res) {
      showAlert(client, 'Successfully unvoted');
    }
  };

  const hasUserVoted = getHasUserVoted(userId, pollLineItems);
  const hasPollExpired = moment(poll.expiration).isBefore(moment());
  return (
    <Block display="flex" flexDirection="column" padding="24px" backgroundColor="#f7f7f7" position="relative">
      {voting && <Loading compact={true} message="Your vote is on the way" />}
      {unvoting && <Loading compact={true} message="Undo voting..." />}
      <Block display="flex" alignItems="center">
        <Label1><b>{poll.name}</b></Label1>
        <Block marginLeft="12px">
          <Button size="compact" kind="minimal" onClick={() => setEditingPoll(true)}><FaPen /></Button>
        </Block>
        {
          (!hasPollExpired && pollLineItems.length && pollLineItems.length < 10) ?
          <Block marginLeft="12px">
            <Button size="compact" kind="secondary" onClick={() => setAddingPollLineItem(true)}><Plus /> Add Poll Item</Button>
          </Block> : null
        }
        <Block flex="1" display="flex" justifyContent="flex-end">
          {
            hasPollExpired ?
            <Label3>Poll expired</Label3> :
            <Label3>Expires {moment(poll.expiration).calendar()}</Label3>
          }

        </Block>
      </Block>
      <Block marginTop="12px">
        {
          pollLineItems.map((i) => {
            return <PollLineItem key={i.id} item={i} handleSelectLineItem={handleSelectLineItem} selectedPollLineItemId={selectedPollLineItemId} />;
          })
        }
        {
          !pollLineItems.length &&
          <Block display="flex" justifyContent="center" marginTop="12px">
            <Label1><b>There is no poll item yet. Add first poll item</b></Label1>
          </Block>
        }
      </Block>
      <Block display="flex" justifyContent="center" marginTop="12px">
        {
          (!hasPollExpired && hasUserVoted && pollLineItems.length) ?
          <Button
            kind="minimal"
            onClick={handleUnvoteLineItem}
          >
            Undo Vote
          </Button> : null
        }
        {
          (!hasPollExpired && !hasUserVoted && pollLineItems.length) ?
          <Button
            disabled={!selectedPollLineItemId}
            onClick={handleVoteLineItem}
          >
            Vote
          </Button> : null
        }
        {
          (!hasPollExpired && !pollLineItems.length) ?
          <Button
            onClick={() => setAddingPollLineItem(true)}
          >
            <Plus /> Add Poll Item
          </Button> : null
        }
      </Block>
      <PollLineItemForm pollId={pollId} showForm={addingPollLineItem} close={() => setAddingPollLineItem(false)} />
      <PollForm showForm={editingPoll} poll={poll} close={() => setEditingPoll(false)} />
    </Block>
  );
};
