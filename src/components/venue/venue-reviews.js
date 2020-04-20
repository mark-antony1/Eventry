import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/react-hooks';
import { Block } from 'baseui/block';
import PillButton from '../pill-button';
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
    <Block display="flex" paddingBottom="24px" flexDirection={['column', 'column', 'row', 'row']}>
      <Block display="flex" marginRight="24px" marginBottom="24px" alignItems="flex-start">
        <Block width="80px" display="flex" marginRight="12px">
          {review.company.logo && <img alt="review-logo" width="100%" style={{ objectFit: 'contain' }} src={review.company.logo} />}
        </Block>
        <Block width="200px">
          <Label1><b>{`${review.user.firstName}`}</b></Label1>
          {`${review.team.name} at ${review.company.name}`}
        </Block>
      </Block>
      <Block flex="1">
        {review.content}
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
        <PillButton onClick={handleCreateEndorsement}>Submit</PillButton>
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
    <Block display="flex" width="100%" flexDirection="column">
      <Label1 marginBottom="24px"><b>Endorsements</b></Label1>
      {reviews.map((review, index) => {
        return (
          <Block key={index} marginRight="24px" marginBottom="24px" overrides={{ Block: { style: {borderBottom: "1px solid #777"}}}}>
            <Review review={review} />
          </Block>
        );
      })}
      <Block display="flex">
        {
          writingEndorsement &&
          <WriteEndorsement symbol={symbol} setWritingEndorsement={setWritingEndorsement} />
        }
        {
          (!checkUserHasWrittenReview && !writingEndorsement) &&
          <PillButton
            onClick={() => {
              if (authData) {
                setWritingEndorsement(true);
              } else {
                history.push(`/user/?from=${symbol}`);
              }
            }}
          >
            Write an endorsement!
          </PillButton>
        }
      </Block>
    </Block>
  );
}
