import React, { useState, useEffect } from 'react';
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
import Select from '../select';
import { Button } from 'baseui/button';
import { Datepicker } from 'baseui/datepicker';
import { TimePicker } from 'baseui/timepicker';
import { FormControl } from 'baseui/form-control';
import Input from '../input';
import { StatefulTooltip } from 'baseui/tooltip';
import { Block } from 'baseui/block';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
  UPDATE_POLL,
  CREATE_POLL
} from '../../constants/mutation';

import { showAlert, getErrorCode, getVenueBySymbol } from '../../utils';
import VenueNameSearchBar from '../venue/venue-name-search-bar';
import Loading from '../../components/loading';
import PillButton from '../pill-button';

function getHasUserVoted(userId, pollLineItems) {
  return pollLineItems.reduce((agg, item) => {
    if (item.voters.find(v => v.id === userId)) {
      return true;
    }
    return agg;
  }, false);
}

function RemovePollLineItemForm({ item, pollLineItemId, showForm, close }) {
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

  const name = item.symbol ? (getVenueBySymbol(item.symbol) || {}).name : item.name;
  return (
    <Modal onClose={close} isOpen={showForm}>
      <ModalHeader>Remove Poll Item</ModalHeader>
      <ModalBody>
        <Label1>Remove {name}?</Label1>
      </ModalBody>
      <ModalFooter>
        <PillButton loading={removingPollLineItem} onClick={handleRemovePollLineItem}>Remove</PillButton>
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
  const { name, time, symbol } = item;
  const userVoted = item.voters.find(v => v.id === userId);

  const renderName = () => {
    const venue = getVenueBySymbol(symbol);
    if (venue) {
      return venue.name;
    }
    return null;
  };

  return (
    <Block display="flex" alignItems="center">
      <Block
        flex="1"
        backgroundColor={(userVoted || selectedPollLineItemId === item.id) ? "#77BA01" : "#ddd"}
        paddingTop="12px"
        paddingBottom="12px"
        paddingLeft="24px"
        paddingRight="24px"
        marginTop="4px"
        display="flex"
        alignItems="center"
        className={css({
          cursor: 'pointer',
          borderRadius: '500px',
          ':hover': {
            backgroundColor: "#77BA01"
          }
        })}
        onClick={() => handleSelectLineItem(item.id)}
      >
        {
          (symbol || name) ? <Label1><b>{symbol ? renderName() : name}</b> {symbol && <Label3 $as="a" href={`/${item.symbol}`} target="_blank">Details</Label3>}</Label1> :
          <Label1><b>{moment(time).format("MMM Do dddd h:mm a")}</b></Label1>
        }

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
        <PillButton onClick={() => setRemovingPollLineItem(true)} size="compact" kind="minimal"><FaTrashAlt /></PillButton>
      </Block>
      <RemovePollLineItemForm item={item} pollLineItemId={item.id} close={() => setRemovingPollLineItem(false)} showForm={removingPollLineItem} />
    </Block>
  );
}

function PollForm({ poll, showForm, close }) {
  const client = useApolloClient();
  const [ form, setForm ] = useState({
    name: poll.name || '',
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
              overrides={{
                Input: {
                  component: Input
                }
              }}
            />
            {
              form.expiration &&
              <Block marginLeft="24px">
                <TimePicker
                  value={form.expiration}
                  onChange={(date) => updateForm({ expiration: date })}
                  overrides={{
                    Select: {
                      props: {
                        overrides: {
                          ControlContainer: {
                            style: {
                              borderRadius: '5px !important',
                              backgroundColor: '#fff !important'
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </Block>
            }
          </Block>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <PillButton loading={updatingPoll} onClick={handleAddPollLineItem}>Save</PillButton>
      </ModalFooter>
    </Modal>
  );
}

export function CreatePollForm({ showForm, close }) {
  const client = useApolloClient();
  const { eventId } = useParams();
  const [ form, setForm ] = useState({
    expiration: null
  });

  const [ formError, setFormError ] = useState(null);
  const [ createPoll, { loading: creatingPoll } ] = useMutation(CREATE_POLL);
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
  const handleCreatePoll = async () => {
    if (!validateForm()) {
      return;
    }

    const res = await createPoll({
      variables: {
        expiration: form.expiration,
        eventId
      },
      refetchQueries: ['GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });

    if (res) {
      showAlert(client, 'Successfully created poll');
      close();
    }
  };
  return (
    <Modal onClose={close} isOpen={showForm}>
      <ModalHeader>Create New Poll</ModalHeader>
      <ModalBody>
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
              overrides={{
                Input: {
                  component: Input
                }
              }}
            />
            {
              form.expiration &&
              <Block marginLeft="24px">
                <TimePicker
                  value={form.expiration}
                  onChange={(date) => updateForm({ expiration: date })}
                  overrides={{
                    Select: {
                      props: {
                        overrides: {
                          ControlContainer: {
                            style: {
                              borderRadius: '5px !important',
                              backgroundColor: '#fff !important'
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </Block>
            }
          </Block>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <PillButton loading={creatingPoll} onClick={handleCreatePoll}>Save</PillButton>
      </ModalFooter>
    </Modal>
  );
}

function VenuePollLineItemForm({ close, pollId }) {
  const client = useApolloClient();
  const [ showManualName, setShowManualName ] = useState(false);
  const [ form, setForm ] = useState({
    name: '',
    venue: null
  });
    const [ formError, setFormError ] = useState(null);
  const [ addPollLineItem, { loading: creatingPollLineItem } ] = useMutation(ADD_POLL_LINEITEM);
  const validateForm = () => {
    if (!form.name && !form.venue) {
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
    <>
      <ModalHeader>Add Venue to Poll</ModalHeader>
      <ModalBody>
        <Block>
          <FormControl error={null} label="Search and Select Venue by Name" positive="">
            <VenueNameSearchBar updateForm={updateForm} form={form} />
          </FormControl>
        </Block>
        <FormControl error={formError} label="Discover Venues" positive="">
          <Block display="flex">
            <Block display="flex" flex="1" flexDirection="column">
              <PillButton kind="secondary" $as="a" target="_blank" href="/v">
                <Tag closeable={false} variant="outlined" kind="negative">New</Tag> Virtual venues
              </PillButton>
            </Block>
            <Block margin="4px" />
            <Block display="flex" flex="1" flexDirection="column">
              <PillButton target="_blank" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900', height: '34px'}}}} $as="a" href="/s">
                Venues in San Francisco
              </PillButton>
            </Block>
          </Block>
        </FormControl>
        <Block height="1px" backgroundColor="#ddd" width="100%" />
        <Block display="flex" marginTop="8px" flex="1" flexDirection="column">
          <PillButton kind="minimal" size="compact" onClick={() => setShowManualName(!showManualName)}>
            Manually Add Name
          </PillButton>
        </Block>
        {
          showManualName &&
          <FormControl error={null} label="Manually Enter Name" positive="" caption="ex) 4th Street Bar">
            <Input
              value={form.name}
              placeholder="enter name"
              onChange={e => {
                updateForm({
                  name: e.currentTarget.value
                });
              }}
            />
          </FormControl>
        }
      </ModalBody>
      <ModalFooter>
        <PillButton loading={creatingPollLineItem} disabled={!validateForm()} onClick={handleAddPollLineItem}>Add</PillButton>
      </ModalFooter>
    </>
  );
}

function TimePollLineItemForm({ close, pollId }) {
  const client = useApolloClient();
  const [ form, setForm ] = useState({
    time: null
  });
  const [ formError, setFormError ] = useState(null);
  const [ addPollLineItem, { loading: creatingPollLineItem } ] = useMutation(ADD_POLL_LINEITEM);
  const validateForm = () => {
    if (!form.time) {
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
    const res = await addPollLineItem({
      variables: {
        pollId,
        time: form.time
      },
      refetchQueries: ['GetEvent']
    }).catch(e => {
      setFormError(getErrorCode(e));
    });
    if (res) {
      showAlert(client, `Successfully added a poll item`);
      setForm({
        time: null
      });
      close();
    }
  };

  return (
    <>
      <ModalHeader>Add Time to Poll</ModalHeader>
      <ModalBody>
        <FormControl label="When to Meet" caption="YYYY/MM/DD HH:MM" positive="" error={null}>
          <Block display="flex">
            <Datepicker
              value={form.time ? [form.time] : null}
              onChange={({date}) => updateForm({ time: date })}
              filterDate={(date) => {
                if (moment(date).isAfter(moment())) {
                  return true;
                }
                return false;
              }}
              overrides={{
                Input: {
                  component: Input
                }
              }}
            />
            {
              form.time &&
              <Block marginLeft="24px">
                <TimePicker
                  value={form.time}
                  onChange={(date) => updateForm({ time: date })}
                  overrides={{
                    Select: {
                      props: {
                        overrides: {
                          ControlContainer: {
                            style: {
                              borderRadius: '5px !important',
                              backgroundColor: '#fff !important'
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </Block>
            }
          </Block>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <PillButton loading={creatingPollLineItem} disabled={!validateForm()} onClick={handleAddPollLineItem}>Add</PillButton>
      </ModalFooter>
    </>
  );
}

function PollLineItemModeForm({ setFormMode }) {
  return (
    <>
      <ModalHeader>Choose Poll Mode</ModalHeader>
      <ModalBody>
        <Block display="flex" justifyContent="center">
          <Block margin="8px">
            <PillButton onClick={() => setFormMode('TIME')}>Poll When to Meet</PillButton>
          </Block>
          <Block margin="8px">
            <PillButton onClick={() => setFormMode('VENUE')}>Poll What to Do</PillButton>
          </Block>
        </Block>
      </ModalBody>
    </>
  );
}

function PollLineItemForm({ pollId, showForm, close, mode }) {
  const [ formMode, setFormMode ] = useState(mode);
  useEffect(() => {
    if (close) {
      setFormMode(null);
    }
  }, [close]);
  return (
    <Modal onClose={close} isOpen={showForm}>
      {
        !mode && !formMode && <PollLineItemModeForm setFormMode={setFormMode} />
      }
      {
        (mode === 'VENUE' || formMode === 'VENUE') && <VenuePollLineItemForm close={close} pollId={pollId} />
      }
      {
        (mode === 'TIME' || formMode === 'TIME') && <TimePollLineItemForm close={close} pollId={pollId} />
      }
    </Modal>
  );
}

const getMode = (lineItems) => {
  if (!lineItems.length) {
    return null;
  }

  if (lineItems[0].time) {
    return 'TIME';
  }

  if (lineItems[0].name || lineItems[0].symbol) {
    return 'VENUE';
  }

  return null;
}

const getDefaultName = (lineItems) => {
  if (!lineItems.length) {
    return 'New Poll';
  }

  if (lineItems[0].time) {
    return 'When to Do';
  }

  if (lineItems[0].name || lineItems[0].symbol) {
    return 'What to Do';
  }

  return '';
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
      <Block display="flex" alignItems="center">
        <Label1><b>{poll.name || getDefaultName(pollLineItems)}</b></Label1>
        {
          (!hasPollExpired && pollLineItems.length && pollLineItems.length < 10) ?
          <Block marginLeft="12px">
            <PillButton size="compact" kind="secondary" onClick={() => setAddingPollLineItem(true)}><Plus /> Add Item</PillButton>
          </Block> : null
        }
        <Block flex="1" display="flex" justifyContent="flex-end" alignItems="center">
          {
            hasPollExpired ?
            <Label3>Poll expired</Label3> :
            <Label3>Expires {moment(poll.expiration).calendar()}</Label3>
          }
          <Block marginLeft="12px">
            <PillButton size="compact" kind="minimal" onClick={() => setEditingPoll(true)}><FaPen /></PillButton>
          </Block>
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
          <Block display="flex" alignItems="center" justifyContent="center" marginTop="12px">
            <Tag closeable={false} variant="outlined" kind="warning"><b>Next step</b></Tag> There is no poll item yet. Add first poll item
          </Block>
        }
      </Block>
      <Block display="flex" justifyContent="center" marginTop="12px">
        {
          (!hasPollExpired && hasUserVoted && pollLineItems.length) ?
          <PillButton
            kind="minimal"
            onClick={handleUnvoteLineItem}
            loading={unvoting}
          >
            Undo Vote
          </PillButton> : null
        }
        {
          (!hasPollExpired && !hasUserVoted && pollLineItems.length) ?
          <PillButton
            disabled={!selectedPollLineItemId}
            onClick={handleVoteLineItem}
            loading={voting}
          >
            Vote
          </PillButton> : null
        }
        {
          (!hasPollExpired && !pollLineItems.length) ?
          <PillButton
            onClick={() => setAddingPollLineItem(true)}
          >
            <Plus /> Add Item
          </PillButton> : null
        }
      </Block>
      <PollLineItemForm pollId={pollId} showForm={addingPollLineItem} mode={getMode(pollLineItems)} close={() => setAddingPollLineItem(false)} />
      <PollForm showForm={editingPoll} poll={poll} close={() => setEditingPoll(false)} />
    </Block>
  );
};
