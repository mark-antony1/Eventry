import gql from 'graphql-tag';
import {
  Company,
  Team,
  User,
  Review,
  EventListItem,
  EventDetails
} from './fragment';

export const LOAD_VENUE_REVIEWS = gql`
query LoadVenueReviews($symbol: String!){
  getReviewsBySymbol(symbol: $symbol)${Review}
  getUserByAuth{
    user${User}
  }
  checkUserHasWrittenReview(symbol: $symbol)
}`;

export const GET_REVIEWS_BY_AUTH = gql`
query GetReviewsByAuth{
  getReviewsByAuth${Review}
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

export const GET_ALERT_MESSAGE = gql`
query GetAlertMessage{
  successAlert @client
}`;

export const LOAD_BOOKING_FORM = gql`
query LoadBookingForm($symbol: String!){
  getBusinessHours(symbol: $symbol){
    id
    day
    open
    close
  }
}`;

export const GET_BUSINESS_HOURS = gql`
query GetBusinessHours($symbol: String!){
  getBusinessHours(symbol: $symbol){
    id
    day
    open
    close
  }
}`;

export const GET_NEW_EVENTS_BY_SYMBOL = gql`
query GetNewEventsBySymbol($symbol: String!){
  getNewEventsBySymbol(symbol: $symbol)${EventListItem}
}`;

export const GET_UPCOMING_EVENTS_BY_SYMBOL = gql`
query GetUpcomingEventsBySymbol($symbol: String!){
  getUpcomingEventsBySymbol(symbol: $symbol)${EventListItem}
}`;

export const GET_PAST_EVENTS_BY_SYMBOL = gql`
query GetPastEventsBySymbol($symbol: String!, $skip: Int!){
  getPastEventsBySymbol(symbol: $symbol, skip: $skip)${EventListItem}
}`;

export const AUTHORIZE_EVENT_PAGE = gql`
query AuthorizeEventPage($eventId: String!){
  authorizeEventPage(eventId: $eventId)
}`;

export const GET_EVENT = gql`
query GetEvent($eventId: String!){
  getEvent(eventId: $eventId)${EventDetails}
}`;
