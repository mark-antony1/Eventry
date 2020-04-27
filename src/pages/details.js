import React, { useState, useEffect } from 'react';
import { Block } from 'baseui/block';
import Button from '../components/button';
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
import DiscoveryMap from '../components/map/discovery-map';
import VenueReviews from '../components/venue/venue-reviews';
import PillButton from '../components/pill-button';
import VirtualEventDetails from './virtual-event-details';
import CreateEventButton from '../components/team/create-event-button';
import CreateEventSelectTeamModal from '../components/team/create-event-team-select-modal';
import { getHourFromMilitaryHour } from '../utils';
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

const Hours = ({ hours }) => {
  return (
    <Block display="flex">
      <Block display="flex" flexDirection="column">
      {
        Object.keys(hours).map((day) => {
          return (
            <Block key={day} paddingRight="12px" paddingTop="12px" paddingBottom="12px"><Label1><b>{day}</b></Label1></Block>
          );
        })
      }
      </Block>
      <Block display="flex" flexDirection="column" marginLeft="12px">
      {
        Object.keys(hours).map((day) => {
          const hour = hours[day];
          return (
            <Block key={`${day}1`} paddingLeft="12px" paddingTop="12px" paddingBottom="12px">
              <Label1>
                {
                  isNaN(hour.start) ?
                  'Closed' : `${getHourFromMilitaryHour(hour.start)} - ${getHourFromMilitaryHour(hour.end)}`
                }
              </Label1>
            </Block>
          );
        })
      }
      </Block>
    </Block>
  );
};

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
      <Block display="flex" flex="1">
        <Block display="flex" alignItems="center">
          <PillButton kind="minimal" onClick={onPrevPhoto}>
            <ChevronLeft size={36} />
          </PillButton>
        </Block>
        <Block flex="1" display="flex" flexDirection="column" height="100%" alignItems="center" justifyContent="center">
          <Block height="calc(80vh - 50px)">
            <img alt="details-venue" height="100%" src={photos[photoIndex]} />
          </Block>
          <Block height="50px" display="flex" alignItems="center" justifyContent="center">
            <Label2>{photoIndex + 1} / {photos.length}</Label2>
          </Block>
        </Block>
        <Block display="flex" alignItems="center">
          <PillButton kind="minimal" onClick={onNextPhoto}>
            <ChevronRight size={36} />
          </PillButton>
        </Block>
      </Block>
    </Block>
  );
};

export default function Details({ match: { params: {venueSymbol} } }) {
  const [ showPhotoDetails, setShowPhotoDetails ] = useState(false);
  const [ initialPhotoIndex, setInitialPhotoIndex ] = useState(null);
  const [ showCreateEventTeamSelect, setShowCreateEventTeamSelect ] = useState(false);
  const [ css ] = useStyletron();
  const venue = allVenues.find((v) => v.symbol === venueSymbol);
  const virtualLocation = allVirtualLocations.find((v) => v.symbol === venueSymbol);
  useEffect(() => {
    document.title = `TeamBright | ${venue ? venue.name : (virtualLocation || {}).name}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPhotoDetails = (index) => {
    document.body.style.overflow = 'hidden';
    setShowPhotoDetails(true);
    setInitialPhotoIndex(index);
  };

  const BackButton = () => {
    return (
      <PillButton kind="secondary" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900'}}}} $as="a" href="/s">
        <ChevronLeft /> Map
      </PillButton>
    );
  };

  if (!venue && !virtualLocation) {
    return (
      <Block display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Label1><b>Venue doesn't exist</b></Label1>
      </Block>
    );
  }

  if (virtualLocation) {
    return <VirtualEventDetails />;
  }

  return (
    <Block display="flex" flexDirection="column">
      {showPhotoDetails && <PhotoDetails photos={venue.photos} initialPhotoIndex={initialPhotoIndex} setShowPhotoDetails={setShowPhotoDetails} />}
      <HeaderNavigation leftButtons={[BackButton]} />
      <Block display="flex" minHeight="20vw" padding="6px">
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
            {
              venue.vibe.map((tag, index) => {
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
        <Block flex="1" display="flex" padding="24px">
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
          <Block flex="1" padding="24px">
            <FaClock />
            <Label2 color="#727272">Duration</Label2>
            <Label2><b>People spend {minutesToAverageTimeSpent(venue.averageTimeSpent)} here</b></Label2>
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
        <Block display="flex" marginTop="68px">
          <VenueReviews symbol={venueSymbol} />
        </Block>
        <Block display="flex" marginTop="68px" flexDirection={['column', 'column', 'row', 'row']}>
          <Block flex="1" marginRight="24px">
            <Label1 marginBottom="24px"><b>Location & Hours</b></Label1>
            <Block height="200px" position="relative">
              <DiscoveryMap venues={[venue]} disableScrollZoom={true} />
            </Block>
            <Block display="flex" marginTop="12px">
              <a rel="noopener noreferrer" className={css({ textDecoration: 'none' })} href={`https://www.google.com/maps/place/${venue.address}`} target="_blank"><Label1 marginTop="8px"><b>{venue.address}</b></Label1></a>
              <Block marginLeft="12px">
                <PillButton $as="a" href={`https://www.google.com/maps/place/${venue.address}`} target="_blank">Open Map</PillButton>
              </Block>
            </Block>
          </Block>
          <Block flex="1">
            <Block width="fit-content">
              <Hours hours={venue.hours} />
            </Block>
          </Block>
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
                <FaRegCalendarAlt /><span style={{ marginLeft:"4px"}}><b>Book</b></span>
              </Button>
            </Block>
          }
          <CreateEventButton showModal={() => setShowCreateEventTeamSelect(true)} />
          <Label2 color="#727272" marginLeft="24px"><b>{venue.name} "{venue.teaserDescription}" from ${venue.price} / person</b></Label2>
        </Block>
      </Block>
      <CreateEventSelectTeamModal showModal={showCreateEventTeamSelect} close={() => setShowCreateEventTeamSelect(false)} symbol={venue.symbol} />
    </Block>
  );
}
