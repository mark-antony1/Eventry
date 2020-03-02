import React, { useState } from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Label2,
  Label3
} from 'baseui/typography';
import { Tag } from 'baseui/tag';

function Vibe({ vibe }) {
  if (vibe === 'Fun') {
    return <Label3>Fun</Label3>;
  }

  if (vibe === 'Exciting') {
    return <Label3>Exciting</Label3>;
  }

  return null;
}

function StarRating({ rate }) {
  return (
    <Block>
      ⭐{rate}
    </Block>
  );
}

export default function VenueCell({ venue }) {
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

  return (
    <Block display="flex" flexDirection="column">
      <Block display="flex" backgroundColor="#000" flexDirection="column" padding="12px">
        <Label3 color="#fff">{venue.name}</Label3>
        <Label2 color="#fff">{venue.events}</Label2>
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
          <Block>
          {
            venue.tags.map((tag, index) => {
              return (
                <Tag key={index} closeable={false} kind="accent">
                  {tag}
                </Tag>
              );
            })
          }
          </Block>
          <Block display="flex">
            {
              venue.vibe.map((vibe, index) => {
                if (venue.vibe.length > index + 1) {
                  return (
                    <Block key={index}>
                      <Vibe vibe={vibe} />
                    </Block>
                  );
                }
                return <Vibe vibe={vibe} key={index} />;
              })
            }
          </Block>
          <Label2>{venue.price}</Label2>
          <StarRating rate={venue.rating} />
          <Label3>Good for {`${venue.recommendedGroupsize[0]} - ${venue.recommendedGroupsize[1]}`} people</Label3>
          <Button $as="a" href={venue.linkToSite} target="_blank">Book</Button>
        </Block>
      </Block>
    </Block>
  );
}
