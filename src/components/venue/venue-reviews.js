import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/react-hooks';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import {
  Display3,
  Paragraph1,
  Label1
} from 'baseui/typography';
import {
  useQuery,
  useMutation
} from '@apollo/react-hooks';

import { getErrorCode, showAlert } from '../../utils';
import { LOAD_VENUE_REVIEWS } from '../../constants/query';
import { CREATE_ENDORSEMENT } from '../../constants/mutation';

const Review = ({ review }) => {
  return (
    <Block display="flex" flexDirection="column" paddingBottom="24px">
      <Block height="50px" display="flex" alignItems="flex-end">
        {review.company.logo && <img alt="review-logo" height="100%" src={review.company.logo} />}
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

const WriteEndorsement = ({ symbol, setWritingEndorsement }) => {
  const client = useApolloClient();
  const [ content, setContent ] = useState('');
  const [ createEndorsementError, setCreateEndorsementError ] = useState(null);
  const [ createEndorsement ] = useMutation(CREATE_ENDORSEMENT);

  const validateForm = () => {
    if (!content.length) {
      setCreateEndorsementError('Please enter endorsement');
      return false;
    }
    return true;
  };
  const handleCreateEndorsement = async () => {
    if (!validateForm()) {
      return;
    }

    const createEndorsementResponse = await createEndorsement({
      variables: {
        symbol,
        content
      },
      refetchQueries: ['LoadVenueReviews']
    }).catch(error => {
      setCreateEndorsementError(getErrorCode(error));
    });

    if (createEndorsementResponse) {
      setWritingEndorsement(false);
      showAlert(client, 'Successfully wrote an endorsement. Thank you!');
    }
  };

  return (
    <Block display="flex" flexDirection="column" width={['80%', '80%', '50%', '50%']}>
      <FormControl
        error={createEndorsementError}
        positive=""
      >
        <Textarea
          value={content}
          placeholder="write endorsement... thank you!"
          onChange={e => {
            setCreateEndorsementError(null);
            if (e.target.value.length <= 500) {
              setContent(e.target.value);
            }
          }}
        />
      </FormControl>
      <Block display="flex" alignItems="center">
        <Button onClick={handleCreateEndorsement}>Submit</Button>
        <Label1 marginLeft="12px">{content.length} / 500</Label1>
      </Block>
    </Block>
  );
};

export default function VenueReviews({ symbol }) {
  const history = useHistory();
  const { data, loading, error } = useQuery(
    LOAD_VENUE_REVIEWS,
    {
      variables: {
        symbol
      }
    }
  );
  const [ writingEndorsement, setWritingEndorsement ] = useState(false);

  if (loading || error) {
    return null;
  }

  const {
    getReviewsBySymbol: reviews,
    getUserByAuth: authData,
    checkUserHasWrittenReview
  } = data;

  return (
    <Block display="flex" marginTop="68px" width="100%" flexDirection={['column', 'column', 'row', 'row']}>
      <Block flex="1">
        <Display3><b>Endorsements</b></Display3>
      </Block>
      <Block flex="2" display="flex" flexDirection="column">
        <Block display="flex" flexWrap="wrap">
          {reviews.map((review, index) => {
            return (
              <Block key={index} flex="0 1 calc(50% - 24px)" marginRight="24px" marginBottom="24px" overrides={{ Block: { style: {borderBottom: "1px solid #777"}}}}>
                <Review review={review} />
              </Block>
            );
          })}
        </Block>
        <Block display="flex">
          {
            writingEndorsement &&
            <WriteEndorsement symbol={symbol} setWritingEndorsement={setWritingEndorsement} />
          }
          {
            (!checkUserHasWrittenReview && !writingEndorsement) &&
            <Button
              onClick={() => {
                if (authData) {
                  setWritingEndorsement(true);
                } else {
                  history.push(`/user/?from=${symbol}`);
                }
              }}
            >
              Write an endorsement!
            </Button>
          }
        </Block>
      </Block>
    </Block>

  );
}
