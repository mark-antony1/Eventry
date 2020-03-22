import gql from 'graphql-tag';
import {
  Company,
  Team,
  User
} from './fragment';

export const LOAD_VENUE_REVIEWS = gql`
query LoadVenueReviews($symbol: String!){
  getReviewsBySymbol(symbol: $symbol){
    content
    company${Company}
    team${Team}
    user${User}
  }
}`;
