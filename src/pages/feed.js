import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Switch, Route } from 'react-router-dom';
import { useStyletron } from 'styletron-react';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Tabs, Tab } from 'baseui/tabs';
import Input from '../components/input';
import Textarea from '../components/textarea';
import PillButton from '../components/pill-button';
import Button from '../components/button';
import { FormControl } from 'baseui/form-control';
import { Navigation } from 'baseui/side-navigation';
import { Datepicker } from 'baseui/datepicker';
import { TimePicker } from 'baseui/timepicker';
import { Tag } from 'baseui/tag';
import { FaHeart, FaComment, FaInstagram, FaEye, FaQrcode, FaFireAlt, FaExclamationCircle, FaYelp } from 'react-icons/fa';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
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
  REPLY_TO_INSTAGRAM_MEDIA_COMMENT,
  REPLY_TO_YELP_REVIEW,
  ARCHIVE_TASK,
  CREATE_DROP,
} from '../constants/mutation';
import {
  LOAD_FEED
} from '../constants/query';

import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

import { getErrorCode, showAlert } from '../utils';

function DropForm({hideForm}) {
  const [ form, setForm ] = useState({
    start_at: null,
    end_at: null,
    content: ''
  });
  const [ error, setError ] = useState(null);
  const [ createDrop, { loading: creatingDrop } ] = useMutation(CREATE_DROP);

  const updateForm = (payload) => {
    setForm({
      ...form,
      ...payload
    });
  };

  const validateForm = () => {
    const {
      start_at,
      end_at,
      content
    } = form;
    if (!start_at || !end_at) {
      setError('Please enter promo time');
      return false;
    }
    if (!content) {
      setError('Please enter promo details');
      return false;
    }
    return true;
  };

  const handleCreateDrop = async () => {
    if (!validateForm()) {
      return;
    }

    const res = await createDrop({
      variables: {
        ...form
      },
      refetchQueries: ['LoadFeed']
    });
  };

  return (
    <Block padding="12px" position="relative" backgroundColor="#eee" display="flex" flexDirection="column">
      {creatingDrop && <Loading message="Creating new promo..." compact={true} />}
      <Block display="flex">
        <FaQrcode color="#a3a3a3" size="50px" />
        <FormControl label="" caption="" positive="" error={error}>
          <Display4 marginLeft="6px">New Promo</Display4>
        </FormControl>
      </Block>
      <Block paddingTop="12px">
        <FormControl label="Promo Details" caption="" positive="" error={null}>
          <Input
            value={form.content}
            placeholder="Drink is on us"
            onChange={(e) => {
              updateForm({
                content: e.target.value
              });
            }}
          />
        </FormControl>
      </Block>
      <Block display="flex">
        <Block flex="1" marginRight="6px">
          <FormControl label="Start Time" caption="" positive="" error={null}>
            <Block display="flex">
              <Datepicker
                value={form.start_at}
                onChange={({date}) => updateForm({ start_at: date })}
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
                form.start_at &&
                <Block marginLeft="12px">
                  <TimePicker
                    value={form.start_at}
                    onChange={(date) => updateForm({ start_at: date })}
                    overrides={{
                      Select: {
                        props: {
                          overrides: {
                            ControlContainer: {
                              style: {
                                borderBottomLeftRadius: '5px',
                                borderBottomRightRadius: '5px',
                                borderTopLeftRadius: '5px',
                                borderTopRightRadius: '5px',
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
        </Block>
        <Block flex="1" marginLeft="6px">
          <FormControl label="End Time" caption="" positive="" error={null}>
            <Block display="flex">
              <Datepicker
                value={form.end_at}
                onChange={({date}) => updateForm({ end_at: date })}
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
                form.end_at &&
                <Block marginLeft="12px">
                  <TimePicker
                    value={form.end_at}
                    onChange={(date) => updateForm({ end_at: date })}
                    overrides={{
                      Select: {
                        props: {
                          overrides: {
                            ControlContainer: {
                              style: {
                                borderBottomLeftRadius: '5px',
                                borderBottomRightRadius: '5px',
                                borderTopLeftRadius: '5px',
                                borderTopRightRadius: '5px',
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
        </Block>
      </Block>
      <Block display="flex">
        <Button onClick={handleCreateDrop}>Create Promo</Button>
        <span style={{ marginLeft: '12px' }} />
        <Button kind="minimal" onClick={() => hideForm()}>Cancel</Button>
      </Block>
    </Block>
  );
}

function Drop({drop}) {
  const {
    start_at,
    end_at,
    id,
    content,
    count,
  } = drop;

  const isOngoingPromo = !moment().isBefore(moment(start_at)) && moment().isBefore(moment(end_at));
  const isUpcomingPromo = moment().isBefore(moment(start_at));
  const isPastPromo = !moment().isBefore(moment(end_at));
  return (
    <Block display="flex">
      <Block display="flex">
        <FaQrcode color="#a3a3a3" size="50px" />
      </Block>
      <Block marginLeft="6px">
        <Block display="flex" alignItems={["initial", "initial", "center", "center"]} flexDirection={['column', 'column', 'row', 'row']}>
          {
            isOngoingPromo && <b><span style={{ color: '#ff3f14' }}>Ongoing Promo</span></b>
          }
          {
            isUpcomingPromo && <b>Upcoming Promo</b>
          }
          {
            isPastPromo && <b>Past Promo</b>
          }
          <span style={{marginLeft: '3px'}} />
          {
            (isOngoingPromo || isUpcomingPromo) && <Label3 color="#aaa" marginLeft="12px"><i>{moment(start_at).format("MM/DD/YY h:mm a")} - {moment(end_at).format("MM/DD/YY h:mm a")}</i></Label3>
          }
          {
            isPastPromo && <Label3 color="#aaa" marginLeft="12px"><i>{moment(end_at).fromNow()}</i></Label3>
          }
        </Block>
        <Block marginTop="12px">
          {content}
          <span style={{marginLeft: '3px'}} />
          {!isPastPromo && <a target="_blank" href={`${process.env.PUBLIC_URL}/drop/${id}`}>{`QR Code >`}</a>}
        </Block>
      </Block>
    </Block>
  );
}

function MoreDropSuggestion() {
  const [ showForm, setShowForm ] = useState(false);

  if (showForm) {
    return <DropForm hideForm={() => setShowForm(false)} />;
  }

  return (
    <Block display="flex">
      <Block display="flex">
        <FaQrcode color="#a3a3a3" size="50px" />
      </Block>
      <Block marginLeft="6px">
        <Block display="flex" alignItems={["initial", "initial", "center", "center"]} flexDirection={['column', 'column', 'row', 'row']}>
          <b>Schedule another promo.</b> <span style={{marginLeft: '6px'}} /> Promo boosts the revenue & make your fans happy
        </Block>
        <Block marginTop="12px">
          <Button color="#ff3f14" onClick={() => setShowForm(true)}>
            Drop the next promo <span style={{marginLeft: '3px'}} /><FaFireAlt color="#ff3f14" />
          </Button>
        </Block>
      </Block>
    </Block>
  );
}

function DropSuggestion({dropSuggestion}) {
  const [ showForm, setShowForm ] = useState(false);
  const {
    days
  } = dropSuggestion;

  if (showForm) {
    return <DropForm hideForm={() => setShowForm(false)} />;
  }

  return (
    <Block display="flex">
      <Block display="flex">
        <FaQrcode color="#a3a3a3" size="50px" />
      </Block>
      <Block marginLeft="6px">
        <Block display="flex" alignItems="center">
          <FaExclamationCircle color="#ff3f14" /> <span style={{marginLeft: '6px'}} /> <b>Last promo was {days} days ago.</b> <span style={{marginLeft: '6px'}} /> Promo boosts the revenue & make your fans happy
        </Block>
        <Block marginTop="12px">
          <Button color="#ff3f14" onClick={() => setShowForm(true)}>
            Drop the new promo now <span style={{marginLeft: '3px'}} /><FaFireAlt color="#ff3f14" />
          </Button>
        </Block>
      </Block>
    </Block>
  );
}

function InstagramComment({comment}) {
  const client = useApolloClient();
  const [ formError, setFormError ] = useState(null);
  const [ replyComment, { loading: replying} ] = useMutation(REPLY_TO_INSTAGRAM_MEDIA_COMMENT, {
    update(cache, { data: { replyToInstagramMediaComment: comment_id } }) {
      const { feed } = cache.readQuery({ query: LOAD_FEED });
      const { instagramMediaList } = feed;
      const newInstagramMediaList = instagramMediaList.map((media) => {
        return {
          ...media,
          comments: media.comments.filter((comment) => comment.id !== comment_id)
        };
      });
      cache.writeQuery({
         query: LOAD_FEED,
         data: {
           feed: {
             ...feed,
             instagramMediaList: newInstagramMediaList
          }
        }
      });
    }
  });
  const [ archiveComment, { loading: archiving} ] = useMutation(ARCHIVE_TASK, {
    update(cache, { data: { archiveTask: media_id } }) {
      const { feed } = cache.readQuery({ query: LOAD_FEED });
      const { instagramMediaList } = feed;
      const newInstagramMediaList = instagramMediaList.map((media) => {
        return {
          ...media,
          comments: media.comments.filter((comment) => comment.id !== media_id)
        };
      });
      cache.writeQuery({
         query: LOAD_FEED,
         data: {
           feed: {
             ...feed,
             instagramMediaList: newInstagramMediaList
          }
        }
      });
    }
  });
  const [ messageValue, setMessageValue ] = useState('');
  const {
    text,
    timestamp,
    id,
  } = comment;

  const handleReplyComment = async () => {
    const res = await replyComment({
      variables: {
        comment_id: id,
        message: messageValue
      },

    }).catch(e => {
      setFormError(e);
    });

    if (res && res.data) {
      showAlert(client, 'Replied!');
      setMessageValue('');
    }
  };

  const handleArchiveComment = async () => {
    const res = await archiveComment({
      variables: {
        media_id: id
      },
    }).catch(e => {
      setFormError(e);
    });

    if (res && res.data) {
      showAlert(client, 'Archived!');
    }
  };

  return (
    <Block position="relative" marginTop="12px" padding="12px" backgroundColor="#eee" overrides={{ Block: { style: { borderRadius: '10px' } } }}>
      {(archiving || replying) && <Loading compact={true} />}
      <Block display="flex" alignItems="center">
        <Tag closeable={false} variant="outlined" kind="negative">New Comment</Tag>
        <Label3 marginLeft="12px">{`${text}`}</Label3> <Label3 color="#aaa" marginLeft="12px"><i>{moment(timestamp).fromNow()}</i></Label3>
      </Block>
      <FormControl label="" positive="" error={formError}>
        <Block marginTop="6px" display="flex" alignItems="center">
          <Input
            value={messageValue}
            size="compact"
            placeholder="Reply Here"
            onChange={(e) => {
              setMessageValue(e.target.value);
            }}
          />
          <Block marginLeft="8px">
            <PillButton onClick={handleReplyComment}>Reply</PillButton>
          </Block>
          <Block marginLeft="4px">
            <PillButton onClick={handleArchiveComment} kind="minimal">Archive</PillButton>
          </Block>
        </Block>
      </FormControl>
    </Block>
  );
}

function InstagramMedia({media}) {
  const {
    comments_count,
    like_count,
    media_url,
    timestamp,
    permalink,
    caption,
    comments,
    insight: {
      impressions
    }
  } = media;
  return (
    <Block display="flex" flexDirection="column">
      <Block display="flex">
        <Block minWidth="50px">
          <FaInstagram color="#dd2a7b" size="50px" />
        </Block>
        <Block width="250px" minWidth="250px" height="300px" marginLeft="6px" overrides={{ Block: { style: { overflow: 'hidden', borderRadius: '10px' } } }}>
          <img
            alt="caption"
            src={media_url}
            width="100%"
            height="100%"
            style={{ objectFit: 'cover' }}
          />
        </Block>
        <Block paddingLeft="12px">
          <Block display="flex" flexDirection="column">
            <Label2>
              <b>Instagram Post</b>
            </Label2>
            <Label2>
              {caption}
            </Label2>
            <Label3 marginTop="6px" color="#aaa"><i>{moment(timestamp).fromNow()}</i></Label3>
            <Block marginTop="6px" display="flex" alignItems="center">
              <Label3>
                <FaHeart color="#ff8c7d" /><span style={{ marginLeft: '6px', marginRight: '6px' }}>{like_count}</span>
                <FaComment color="#6ceb5b" /><span style={{ marginLeft: '6px', marginRight: '6px' }}>{comments_count}</span>
                <FaEye /><span style={{ marginLeft: '6px' }}>{impressions}</span>
                <span style={{ marginLeft: '6px' }} /><a target="_blank" href={permalink}>{`Post >`}</a>
              </Label3>
            </Block>
          </Block>
        </Block>
      </Block>
      {
        comments.map((comment, index) => {
          return <InstagramComment comment={comment} key={index} />;
        })
      }
    </Block>
  );
}

function YelpReview({review}) {
  const {
    id,
    post_at,
    content,
    link,
    name,
  } = review;
  const client = useApolloClient();
  const [ messageValue, setMessageValue ] = useState('');

  const [ replyReview, { loading: repliing } ] = useMutation(REPLY_TO_YELP_REVIEW, {
    update(cache) {
      const { feed } = cache.readQuery({ query: LOAD_FEED });
      const { yelpReviewList } = feed;
      const newYelpReviewList = yelpReviewList.filter((review) => {
        return review.id !== id;
      });
      cache.writeQuery({
         query: LOAD_FEED,
         data: {
           feed: {
             ...feed,
             yelpReviewList: newYelpReviewList
          }
        }
      });
    }
  });

  const [ error, setError ] = useState(null);

  const validateForm = () => {
    if (!messageValue) {
      setError('Please enter reply');
      return false;
    }
    return true;
  };

  const handleReplyReview = async () => {
    if (!validateForm()) {
      return;
    }

    const res = await replyReview({
      variables: {
        content: messageValue,
        link,
        name,
      },
    });

    if (res && res.data) {
      showAlert(client, 'Replied!');
    }
  };


  return (
    <Block display="flex" flexDirection="column">
      <Block display="flex">
        <Block minWidth="50px">
          <FaYelp color="#c41200" size="50px" />
        </Block>
        <Block padding="6px">
          <Block display="flex" flexDirection="column">
            <Label2>
              <b>{name}</b>
            </Label2>
            <Label2>
              <a target="_blank" href={link}>{`See in Yelp >`}</a>
            </Label2>
          </Block>
        </Block>
      </Block>
      <Block position="relative" marginTop="12px" padding="12px" backgroundColor="#eee" overrides={{ Block: { style: { borderRadius: '10px' } } }}>
        <Block display="flex">
          <Tag closeable={false} variant="outlined" kind="negative">New Review</Tag>
          <Block display="flex" flexDirection="column">
            <Label3 marginLeft="12px" overrides={{ Label: { style: { wordWrap: 'break-word' } } }}>
              {content}
            </Label3>
            <Label3 marginTop="6px" color="#aaa" marginLeft="12px"><i>{moment(post_at).fromNow()}</i></Label3>
          </Block>
        </Block>
        <FormControl label="" positive="" error={error}>
          <Block marginTop="6px" display="flex" alignItems="center">
            <Textarea
              value={messageValue}
              size="compact"
              placeholder="Reply Here"
              onChange={(e) => {
                setMessageValue(e.target.value);
              }}
            />
            <Block marginLeft="8px">
              <PillButton onClick={handleReplyReview}>Reply</PillButton>
            </Block>
          </Block>
        </FormControl>
      </Block>
    </Block>
  );
}

function generateFeeds(list) {
  let onGoingDrop = false;
  let latestDrop;
  const feeds = list.reduce((agg, item) => {
    if (item.__typename === 'InstagramMedia') {
      return [...agg, item];
    }

    if (item.__typename === 'YelpReview') {
      return [...agg, item];
    }
    if (item.__typename === 'Drop') {
      if (moment().isBefore(moment(item.end_at))) {
        onGoingDrop = true;
        return [...agg, item];
      } else {
        return [...agg, item];
      }

      if (!latestDrop || (latestDrop && moment(latestDrop.end_at).isBefore(item.end_at))) {
        latestDrop = item;
      }
    }

    return agg;
  }, []).sort((a, b) => {
    const timeStampA = a.timestamp || a.end_at || a.post_at;
    const timeStampB = b.timestamp || b.end_at || b.post_at;

    if (a.__typename === 'Drop' && !moment().isBefore(moment(a.start_at)) && moment().isBefore(moment(a.end_at))) {
      return -1;
    }
    return timeStampB - timeStampA;
  });

  if (!onGoingDrop && moment().diff(latestDrop.end_at, 'days') > 7) {
    feeds.unshift({
      days: moment().diff(latestDrop.end_at, 'days'),
      __typename: 'DropSuggestion'
    });
  }

  if (onGoingDrop) {
    feeds.push({
      __typename: 'MoreDropSuggestion'
    });
  }
  return feeds;
}

function Feed({ feed }) {
  if (feed.__typename === 'InstagramMedia') {
    return <InstagramMedia media={feed} />;
  }

  if (feed.__typename === 'DropSuggestion') {
    return <DropSuggestion dropSuggestion={feed} />;
  }

  if (feed.__typename === 'Drop') {
    return <Drop drop={feed} />;
  }

  if (feed.__typename === 'MoreDropSuggestion') {
    return <MoreDropSuggestion />;
  }

  if (feed.__typename === 'YelpReview') {
    return <YelpReview review={feed} />;
  }

  return null;
}

function Feeds() {
  const { loading, data, error } = useQuery(LOAD_FEED);

  if (loading) {
    return <Loading />;
  }

  const {
    feed: {
      instagramMediaList,
      dropList,
      yelpReviewList
    }
  } = data;

  const feeds = generateFeeds([...instagramMediaList, ...dropList, ...yelpReviewList]);

  return (
    <Block
      display="flex"
      alignItems="center"
      justifyContent="center"
      paddingTop="24px"
      paddingBottom="24px"
      paddingLeft={["24px", "24px", "60px", "60px"]}
      paddingRight={["24px", "24px", "60px", "60px"]}
    >
      <Block width={['100%', '100%', '100%', '50%']}>
      {
        feeds.map((item, index) => {
          return (
            <Block
              padding="12px"
              marginBottom="12px"
              key={index}
              overrides={{
                Block: {
                  style: {
                    borderRadius: '10px',
                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.38)'
                  }
                }
              }}
            >
              <Feed feed={item} />
            </Block>
          );
        })
      }
      </Block>
    </Block>
  );
}

export default () => {
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[]} />
      <Feeds />
    </Block>
  );
}
