import React, { useState, useEffect, useRef } from 'react';
import { Block } from 'baseui/block';
import { StatefulTooltip } from 'baseui/tooltip';
import { FaQuestionCircle, FaStar } from 'react-icons/fa';
import { useStyletron } from 'styletron-react';
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

export default function VenueCell({ venue, hovered }) {
  const [ css ] = useStyletron();
  const [ intervalId, setIntervalId ] = useState(null);
  const [ photoIndex, setPhotoIndex ] = useState(0);
  const photoIndexRef = useRef(photoIndex);
  photoIndexRef.current = photoIndex;

  useEffect(() => {
    if (hovered && intervalId === null) {
      const id = setInterval(onNextPhoto, 2250);
      setIntervalId(id);
    }
    if (!hovered && intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ hovered ]);

  const onNextPhoto = () => {
    if (photoIndexRef.current === venue.photos.length - 1) {
      setPhotoIndex(0);
    } else {
      setPhotoIndex(photoIndexRef.current + 1);
    }
  };

  return (
    <Block display="flex" flexDirection="column">
      <Block height="300px" overrides={{ Block: { style: { overflow: 'hidden', borderRadius: '10px' } } }}>
        <img alt="" className={css({
            animationDuration: "2.25s",
            animationIterationCount: "infinite",
            animationDelay: ".25s",
            animationName: hovered ? {
              from: {
                transform: 'scale(1.0)'
              },
              to: {
                transform: 'scale(1.075)'
              }
            } : {}
          })}
          width="100%"
          height="100%"
          style={{ objectFit: 'cover' }}
          src={venue.photos[photoIndex]}
        />
      </Block>
      <Block
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        padding="24px"
      >
        <Block>
          <Label2 color="#484848"><b>{venue.name}</b></Label2>
        </Block>
        <Block>
          <Label1><b>{venue.teaserDescription}</b></Label1>
        </Block>
        <Block marginLeft="-6px">
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
        <Block display="flex">
          <Label2 color="#484848" paddingRight="4px"><b>From ${venue.price} / person</b></Label2>
          <StatefulTooltip
            accessibilityType={'tooltip'}
            content={venue.priceReasoning}
          >
            <Label2 color="#484848"><FaQuestionCircle style={{verticalAlign: 'text-top'}} /></Label2>
          </StatefulTooltip>
        </Block>
        <Label2 color="#484848"><b>{minutesToAverageTimeSpent(venue.averageTimeSpent)}</b></Label2>
        <Label2 color="#0B6839"><b>{venue.rating} <FaStar style={{verticalAlign: 'text-top'}} /></b></Label2>
      </Block>
    </Block>
  );
}
