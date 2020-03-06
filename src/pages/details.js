import React, { useState } from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tag } from 'baseui/tag';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  StyledTable,
  StyledHeadCell,
  StyledBodyCell,
} from 'baseui/table-grid';
import {
  Card,
  StyledBody
} from 'baseui/card';
import {
  Display4,
  Label1
} from 'baseui/typography';
import DiscoveryMap from '../components/map/discovery-map';
import VenueCell from '../components/venue/venue-cell';
import { venues as allVenues } from '../constants/locations';

function minutesToAverageTimeSpent(minutes) {
  if (minutes <= 60) {
    return '1 hour or less';
  }

  if (minutes > 60 && minutes <= 180) {
    return '1 - 3 hours';
  }

  return '3 hours or more';
}

function getHourFromMilitaryHour(hour) {
  if (hour === 12) {
    return '12PM';
  }
  if (hour === 24) {
    return '12AM';
  }
  if (hour > 12) {
    return `${hour - 12}PM`;
  }
  return `${hour}AM`;
}

export default function Details({ match: { params: {venueSymbol} } }) {
  const [ photoIndex, setPhotoIndex ] = useState(0);

  const onPrevPhoto = () => {
    if (photoIndex === 0) {
      setPhotoIndex(venue.photos.length - 1)
    } else {
      setPhotoIndex(photoIndex - 1)
    }
  };

  const onNextPhoto = () => {
    if (photoIndex === venue.photos.length - 1) {
      setPhotoIndex(0)
    } else {
      setPhotoIndex(photoIndex + 1)
    }
  };
  const venue = allVenues.find((v) => v.symbol === venueSymbol);

  return (
    <Block display="flex" flexDirection="column" height="calc(100vh - 73px)">
      <Block display="flex" backgroundColor="#000" flexDirection="column" padding="12px">
        <Display4 color="#fff">{venue.name}</Display4>
        <Label1 color="#fff">{venue.events}</Label1>
      </Block>
      <Block display="flex" flexDirection={["column", "column", "row", "row"]} flex="1 1 auto" overflow={["initial", "initial", "auto", "auto"]}>
        <Block flex="4" position="relative">
          <Block position="absolute" top="0" left="0" height="100%" display="flex" flexDirection="column" justifyContent="center">
            <Button kind="minimal" onClick={onPrevPhoto}>
              <ChevronLeft color="#fff" size={36} />
            </Button>
          </Block>
          <img width="100%" height="100%" style={{ objectFit: 'cover' }} src={venue.photos[photoIndex]} />
          <Block position="absolute" top="0" right="0" height="100%" display="flex" flexDirection="column" justifyContent="center">
            <Button kind="minimal" onClick={onNextPhoto}>
              <ChevronRight color="#fff" size={36} />
            </Button>
          </Block>
        </Block>
        <Block flex="5" display="flex" flexDirection="column" overflow="auto">
          <Block height="200px" position="relative">
            <Block position="absolute" top="10px" right="10px" overrides={{ Block: { style: { zIndex: 1}}}}>
              <Button $as="a" href={`https://www.google.com/maps/place/${venue.address}`} target="_blank">Open Map</Button>
            </Block>
            <DiscoveryMap venues={[venue]} disableScrollZoom={true} />
          </Block>
          <Block
            flex="1"
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            padding="24px"
          >
            <Block display="flex">
              <Block>
                <Card>
                  <Label1 paddingBottom="24px"><i>{venue.events}</i></Label1>
                  <StyledBody>
                    {venue.description}
                  </StyledBody>
                </Card>
              </Block>
              <Block marginLeft="12px">
                <StyledTable $gridTemplateColumns="minmax(max-content, max-content) max-content">
                  {
                    Object.keys(venue.hours).map((day) => {
                      const hour = venue.hours[day];
                      return [
                        <StyledHeadCell key={day}>{day}</StyledHeadCell>,
                        <StyledBodyCell key={`${day}1`}>
                          {
                            isNaN(hour.start) ?
                            'Closed' : `${getHourFromMilitaryHour(hour.start)} - ${getHourFromMilitaryHour(hour.end)}`
                          }
                        </StyledBodyCell>
                      ];
                    })
                  }
                </StyledTable>
              </Block>
            </Block>
            <Block marginTop="24px">
              <StyledTable $gridTemplateColumns="minmax(max-content, max-content) minmax(200px, max-content)">
                <StyledHeadCell>Type</StyledHeadCell>
                <StyledBodyCell>
                  {
                    venue.tags.map((tag, index) => {
                      return (
                        <Tag key={index} closeable={false} kind="accent">
                          {tag}
                        </Tag>
                      );
                    })
                  }
                </StyledBodyCell>
                <StyledHeadCell>Vibe</StyledHeadCell>
                <StyledBodyCell>{venue.vibe.join(',')}</StyledBodyCell>
                <StyledHeadCell>Price</StyledHeadCell>
                <StyledBodyCell>{venue.price}</StyledBodyCell>
                <StyledHeadCell>Average Duration</StyledHeadCell>
                <StyledBodyCell>People spend <b>{minutesToAverageTimeSpent(venue.averageTimeSpent)}</b> here</StyledBodyCell>
                <StyledHeadCell>Rating</StyledHeadCell>
                <StyledBodyCell>⭐{venue.rating}</StyledBodyCell>
                <StyledHeadCell>Recommend Group Size</StyledHeadCell>
                <StyledBodyCell>Good for {`${venue.recommendedGroupsize[0]} - ${venue.recommendedGroupsize[1]}`} people</StyledBodyCell>
                <StyledHeadCell>Place</StyledHeadCell>
                <StyledBodyCell>{venue.place}</StyledBodyCell>
                <StyledHeadCell>Address</StyledHeadCell>
                <StyledBodyCell>{venue.address}</StyledBodyCell>
                <StyledHeadCell>Phone</StyledHeadCell>
                <StyledBodyCell>{venue.phoneNumber}</StyledBodyCell>
                <StyledHeadCell>Email</StyledHeadCell>
                <StyledBodyCell>{venue.email}</StyledBodyCell>
                <StyledHeadCell>Parking Available</StyledHeadCell>
                <StyledBodyCell>{venue.parkingAvailable ? 'Yes' : 'No'}</StyledBodyCell>
              </StyledTable>
            </Block>
            <Block display="flex" flexDirection="column" width="100%" marginTop="24px">
              <Button $as="a" href={venue.linkToSite} target="_blank">Book</Button>
            </Block>
          </Block>
        </Block>

      </Block>
    </Block>
  );
}
