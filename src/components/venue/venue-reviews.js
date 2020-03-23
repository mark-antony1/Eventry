import React from 'react';
import { Block } from 'baseui/block';
import {
  Display2,
  Paragraph1,
  Label1
} from 'baseui/typography';
import {
  useQuery
} from '@apollo/react-hooks';

import { LOAD_VENUE_REVIEWS } from '../../constants/query';


const Review = ({ review }) => {
  return (
    <Block display="flex" flexDirection="column">
      <Block height="50px">
        <img alt="review-logo" height="100%" src={review.company.logo} />
      </Block>
      <Block marginTop="12px">
        <Paragraph1>
          {review.content}
        </Paragraph1>
      </Block>
      <Block marginTop="12px">
        <Label1><b>{`${review.user.firstName}, ${review.team.name} at ${review.company.name}`}</b></Label1>
      </Block>
    </Block>
  );
};

export default function VenueReviews({ symbol }) {
  const { data, loading, error } = useQuery(
    LOAD_VENUE_REVIEWS,
    {
      variables: {
        symbol
      }
    }
  );

  if (loading || error) {
    return null;
  }

  const {
    getReviewsBySymbol: reviews
  } = data;

  if (!reviews.length) {
    return null;
  }

  return (
    <Block display="flex" marginTop="68px">
      <Block flex="1">
        <Display2><b>Reviews</b></Display2>
      </Block>
      <Block flex="2" display="flex" flexWrap="wrap">
        {reviews.map((review, index) => {
          return (
            <Block key={index} flex="0 1 45%">
              <Review review={review} />
            </Block>
          );
        })}
      </Block>
    </Block>

  );
}
