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
  getUserByAuth{
    user${User}
  }
}`;

export const GET_USER_BY_AUTH = gql`
query GetUserByAuth{
  getUserByAuth{
    token
    user${User}
  }
}`;

export const LOAD_USER_PROFILE = gql`
query LoadUserProfile{
  getUserByAuth{
    token
    user${User}
  }
  getUserProfileByAuth{
    company${Company}
    team${Team}
  }
}`;

export const GET_TEAMS_BY_EMAIL = gql`
query GetTeamsByEmail($email: String!){
  getTeamsByEmail(email: $email){
    name
  }
}`;
