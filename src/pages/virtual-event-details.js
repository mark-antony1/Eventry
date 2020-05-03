import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Block } from 'baseui/block';
import Button from '../components/button';
import PillButton from '../components/pill-button';
import { useStyletron } from 'styletron-react';
import { StatefulTooltip } from 'baseui/tooltip';
import { Tag } from 'baseui/tag';
import {
  FaQuestionCircle,
  FaStar,
  FaUserFriends,
  FaMoneyBill,
  FaClock,
  FaRegCalendarAlt
} from 'react-icons/fa';
import DeleteIcon from 'baseui/icon/delete';
import CheckIcon from 'baseui/icon/check';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Display3,
  Display4,
  Paragraph1,
  Label1,
  Label2
} from 'baseui/typography';
import HeaderNavigation from '../components/header-navigation';
import VenueReviews from '../components/venue/venue-reviews';
import CreateEventButton from '../components/team/create-event-button';
import CreateEventSelectTeamModal from '../components/team/create-event-team-select-modal';
import { venues as allVenues } from '../constants/locations';
import { venues as allVirtualLocations } from '../constants/virtual-locations';

function minutesToAverageTimeSpent(minutes) {
  if (minutes <= 60) {
    return '1 hour or less';
  }

  if (minutes > 60 && minutes <= 180) {
    return '1 - 3 hours';
  }

  return '3 hours or more';
}

const PhotoDetails = ({ photos, initialPhotoIndex, setShowPhotoDetails }) => {
  const [ photoIndex, setPhotoIndex ] = useState(initialPhotoIndex);

  const onPrevPhoto = () => {
    if (photoIndex === 0) {
      setPhotoIndex(photos.length - 1)
    } else {
      setPhotoIndex(photoIndex - 1)
    }
  };

  const onNextPhoto = () => {
    if (photoIndex === photos.length - 1) {
      setPhotoIndex(0)
    } else {
      setPhotoIndex(photoIndex + 1)
    }
  };

  const hidePhotoDetails = () => {
    document.body.style.overflow = 'auto';
    setShowPhotoDetails(false);
  };

  return (
    <Block
      position="fixed"
      top="0px"
      left="0px"
      width="100%"
      height="100%"
      backgroundColor="#fff"
      overrides={{ Block: { style: { zIndex: 10}}}}
      display="flex"
      flexDirection="column"
    >
      <Block>
        <PillButton kind="minimal" onClick={hidePhotoDetails}>
          <DeleteIcon size={36} />
        </PillButton>
      </Block>
      <Block flex="1" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Block height="calc(80vh - 50px)">
          <img alt="details-venue" height="100%" src={photos[photoIndex]} />
        </Block>
        <Block display="flex" marginTop="12px" alignItems="center" justifyContent="center">
          <PillButton kind="minimal" onClick={onPrevPhoto}>
            <ChevronLeft size={36} />
          </PillButton>
          <Label2>{photoIndex + 1} / {photos.length}</Label2>
          <PillButton kind="minimal" onClick={onNextPhoto}>
            <ChevronRight size={36} />
          </PillButton>
        </Block>
      </Block>
    </Block>
  );
};

export default function Details() {
  const { venueSymbol } = useParams();
  const [ showPhotoDetails, setShowPhotoDetails ] = useState(false);
  const [ initialPhotoIndex, setInitialPhotoIndex ] = useState(null);
  const [ showCreateEventTeamSelect, setShowCreateEventTeamSelect ] = useState(false);
  const [ css ] = useStyletron();
  const venue = allVirtualLocations.find((v) => v.symbol === venueSymbol);
  useEffect(() => {
    document.title = `TeamBright | ${venue ? venue.name : ''}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPhotoDetails = (index) => {
    document.body.style.overflow = 'hidden';
    setShowPhotoDetails(true);
    setInitialPhotoIndex(index);
  };

  const BackButton = () => {
    return (
      <PillButton kind="secondary" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900'}}}} $as="a" href="/v">
        <ChevronLeft /> Search
      </PillButton>
    );
  };

  return (
    <Block display="flex" flexDirection="column">
      {showPhotoDetails && <PhotoDetails photos={venue.photos} initialPhotoIndex={initialPhotoIndex} setShowPhotoDetails={setShowPhotoDetails} />}
      <HeaderNavigation leftButtons={[BackButton]} />
      <Block display="flex" height="20vw" padding="6px">
        {venue.photos.slice(0, 4).map((photo, index) => {
          return (
            <Block
              flex="1"
              margin="4px"
              key={index}
              onClick={() => { openPhotoDetails(index) }}
              overrides={{ Block: {style: {cursor: 'pointer'}}}}
            >
              <img alt={`venue-${index}`} width="100%" height="100%" style={{ objectFit: 'cover' }} src={photo} />
            </Block>
          );
        })}
      </Block>
      <Block padding="24px" display="flex" flexDirection={['column', 'column', 'row', 'row']}>
        <Block flex="1" paddingLeft="12px" paddingRight="24px">
          <Label1><b>{venue.name}</b></Label1>
          <Display4 marginTop="8px"><b>{venue.teaserDescription}</b></Display4>
          <Block marginLeft="-5px" marginTop="8px">
            {
              venue.tags.map((tag, index) => {
                return (
                  <Tag key={index} closeable={false} kind="accent" variant="outlined">
                    <b>{tag}</b>
                  </Tag>
                );
              })
            }
          </Block>
          <a rel="noopener noreferrer" className={css({ textDecoration: 'none' })} href={`https://www.google.com/maps/place/${venue.address}`} target="_blank"><Label1 marginTop="8px"><b>{venue.address}</b></Label1></a>
          <Label2 color="#0B6839" marginTop="8px"><b>{venue.rating} <FaStar style={{verticalAlign: 'text-top'}} /></b></Label2>
        </Block>
        <Block flex="1" display="flex" padding={['0px', '0px', '24px', '24px']}>
          <Block flex="1" padding="24px">
            <FaUserFriends />
            <Label2 color="#727272">Group Size</Label2>
            <Label2><b>Good for {`${venue.recommendedGroupsize[0]} - ${venue.recommendedGroupsize[1]}`} people</b></Label2>
          </Block>
          <Block flex="1" padding="24px">
            <FaMoneyBill />
            <Block display="flex">
              <Label2 color="#727272" marginRight="8px">Budget</Label2>
              <StatefulTooltip
                accessibilityType={'tooltip'}
                content={venue.priceReasoning}
              >
                <Label2 color="#727272"><FaQuestionCircle style={{verticalAlign: 'text-top'}} /></Label2>
              </StatefulTooltip>
            </Block>
            <Label2><b>From ${venue.price} / person</b></Label2>
          </Block>
        </Block>
      </Block>
      <Block backgroundColor="#f4f4f4" paddingLeft="36px" paddingRight="36px" paddingTop="56px" paddingBottom="150px">
        <Block display="flex" flexDirection="column">
          <Block display="flex" alignItems="center" marginBottom="12px">
            <Label1><b>About the venue</b></Label1>
            <Block marginLeft="12px">
              <Button kind="secondary" color="#fff" backgroundColor="#77B900" $as="a" href={venue.linkToSite} target="_blank">
                <CheckIcon size={24} /><b>Visit Website</b>
              </Button>
            </Block>
          </Block>
          <Block>{venue.description}</Block>
        </Block>
        {
          venue.videoTitle && venue.videoTitle.length > 0 ?
          <Block display="flex" flexDirection="column" marginTop="30px">
            <Block display="flex" alignItems="center" flexDirection="column" marginBottom="12px">
              <Label1><b>{venue.videoTitle}</b></Label1>
              <Block marginTop="20px">

              <iframe title="t" width="560" height="315" src={venue.videoLink} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
              </iframe>
              </Block>
            </Block>
          </Block> : null
        }
        {
          venue.relevantLinks && venue.relevantLinks.length ?
          <Block display="flex" marginTop="68px" flexDirection="column">
            <Label1 marginBottom="24px"><b>Relevant links</b></Label1>
            {
              venue.relevantLinks.map(link => {
                return (
                  <a rel="noopener noreferrer" className={css({ textDecoration: 'none' })} key={link} href={link} target="_blank">
                    <Label1><b>{link}</b></Label1>
                  </a>
                );
              })
            }
          </Block> : null
        }
        <Block display="flex" marginTop="68px">
          <VenueReviews symbol={venueSymbol} />
        </Block>
      </Block>
      <Block
        position="fixed"
        bottom="0px"
        left="0px"
        right="0px"
        display="flex"
        justifyContent="flex-end"
        padding="12px"
        backgroundColor="#fff"
        overrides={{ Block: { style: { zIndex: 5, boxShadow: '0px 5px 20px 0px rgba(0,0,0,0.75)' }}}}
      >
        <Block display="flex" flex="1" alignItems="center" paddingLeft="12px">
          {
            venue.linkToBook &&
            <Block marginRight="12px">
              <Button kind="secondary" color="#fff" backgroundColor="#FF9D15" $as="a" href={venue.linkToBook} target="_blank">
                <FaRegCalendarAlt color="#fff" /><span style={{ marginLeft:"4px"}}><b>Book</b></span>
              </Button>
            </Block>
          }
          <CreateEventButton showModal={() => setShowCreateEventTeamSelect(true)} />
          <Block marginLeft="24px" display={['none', 'none', 'initial', 'initial']}>
            <Label2 color="#727272"><b>{venue.name} "{venue.teaserDescription}" from ${venue.price} / person</b></Label2>
          </Block>
        </Block>
      </Block>
      <CreateEventSelectTeamModal showModal={showCreateEventTeamSelect} close={() => setShowCreateEventTeamSelect(false)} symbol={venue.symbol} />
    </Block>
  );
}
