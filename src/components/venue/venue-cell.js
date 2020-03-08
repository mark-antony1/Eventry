import React, { useState } from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { StatefulTooltip } from 'baseui/tooltip';
import CheckIcon from 'baseui/icon/check';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Label1,
  Label2,
} from 'baseui/typography';
import { Tag } from 'baseui/tag';

function minutesToAverageTimeSpent(minutes) {
  if (minutes <= 60) {
    return '1 hour or less';
  }

  if (minutes > 60 && minutes <= 180) {
    return '1 - 3 hours';
  }

  return '3 hours or more';
}

export default function VenueCell({ venue }) {
  const [ photoIndex, setPhotoIndex ] = useState(0);

  const onPrevPhoto = (e) => {
    e.stopPropagation();
    if (photoIndex === 0) {
      setPhotoIndex(venue.photos.length - 1)
    } else {
      setPhotoIndex(photoIndex - 1)
    }
  };

  const onNextPhoto = (e) => {
    e.stopPropagation();
    if (photoIndex === venue.photos.length - 1) {
      setPhotoIndex(0)
    } else {
      setPhotoIndex(photoIndex + 1)
    }
  };

  return (
    <Block display="flex" flexDirection="column" overrides={{ Block: { style: { boxShadow: '0px 2px 3px 0px rgba(85,85,85,1)' } } }}>
      <Block display="flex" backgroundColor="#0B6839" flexDirection="column" padding="12px">
        <Label1 style={{fontSize: "20px", fontWeight: 'bold'}} color="#fff">{venue.teaserDescription}</Label1>
        <Label2 color="#fff"><b>{venue.name}</b></Label2>
      </Block>
      <Block display="flex">
        <Block flex="1" position="relative" maxHeight="300px">
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
        <Block
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          padding="24px"
        >
          <Block marginLeft="-6px">
          {
            venue.tags.map((tag, index) => {
              return (
                <Tag key={index} closeable={false} kind="accent">
                  <b>{tag}</b>
                </Tag>
              );
            })
          }
          {
            venue.vibe.map((vibe, index) => {
              return (
                <Tag key={index} closeable={false} kind="accent">
                  <b>{vibe}</b>
                </Tag>
              );
            })
          }
          </Block>
          <Label2 marginTop="12px"><b>Good for {`${venue.recommendedGroupsize[0]} - ${venue.recommendedGroupsize[1]}`} people</b></Label2>
          <Label2 marginTop="12px"><b>People spend {minutesToAverageTimeSpent(venue.averageTimeSpent)} here</b></Label2>
          <Label2 marginTop="12px">
            <b>Budget: ${venue.price} per person {` `}</b>
            <StatefulTooltip
              content={venue.priceReasoning}
              returnFocus
              autoFocus
            >
              ℹ️
            </StatefulTooltip>
          </Label2>
          <Label2 marginTop="12px"><b>⭐{venue.rating}</b></Label2>
          <Block marginTop="12px">
            <Button kind="secondary" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900'}}}} $as="a" href={venue.linkToSite} target="_blank">
              <CheckIcon size={24} color="#fff" /><b>Book</b>
            </Button>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
