import React, { useState } from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { StatefulTooltip } from 'baseui/tooltip';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Label1,
  Label2,
  Label3
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
    <Block display="flex" flexDirection="column">
      <Block display="flex" backgroundColor="#000" flexDirection="column" padding="12px">
        <Label3 color="#fff">{venue.name}</Label3>
        <Label1 color="#fff">{venue.teaserDescription}</Label1>
      </Block>
      <Block display="flex">
        <Block flex="1" position="relative">
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
                  {tag}
                </Tag>
              );
            })
          }
          {
            venue.vibe.map((vibe, index) => {
              return (
                <Tag key={index} closeable={false} kind="accent">
                  {vibe}
                </Tag>
              );
            })
          }
          </Block>
          <Label3 marginTop="12px">Good for {`${venue.recommendedGroupsize[0]} - ${venue.recommendedGroupsize[1]}`} people</Label3>
          <Label3 marginTop="12px">People spend {minutesToAverageTimeSpent(venue.averageTimeSpent)} here</Label3>
          <StatefulTooltip
            content={venue.priceReasoning}
            returnFocus
            autoFocus
          >
            <Label3 marginTop="12px">Budget: ${venue.price} per person</Label3>
          </StatefulTooltip>
          <Label3 marginTop="12px">⭐{venue.rating}</Label3>
          <Block marginTop="12px">
            <Button $as="a" href={venue.linkToSite} target="_blank">Book</Button>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
