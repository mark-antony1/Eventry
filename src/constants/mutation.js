import gql from 'graphql-tag';
import {
  User
} from './fragment';

export const CREATE_USER = gql`
mutation CreateUser($email: String!, $password: String!, $firstName: String!, $lastName: String!, $team: String!, $googleTokenHash: String){
  createUser(email: $email, password: $password, firstName: $firstName, lastName: $lastName, team: $team, googleTokenHash: $googleTokenHash){
    token
    user${User}
  }
}`;

export const CHANGE_PASSWORD = gql`
mutation ChangePassword($currentPassword: String!, $newPassword: String!){
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}`;

export const SIGN_IN = gql`
mutation Signin($email: String!, $password: String!, $googleTokenId: String){
  signin(email: $email, password: $password, googleTokenId: $googleTokenId){
    token
    user${User}
  }
}`;

export const CREATE_ENDORSEMENT = gql`
mutation CreateReview($content: String!, $symbol: String!){
  createReview(content: $content, symbol: $symbol)
}`;

export const DELETE_ENDORSEMENT = gql`
mutation DeleteReivew($reviewId: String!){
  deleteReview(reviewId: $reviewId)
}`;

export const BOOK_EVENT = gql`
mutation BookEvent($groupSize: Int!, $note: String, $masterPhoneNumber: String!, $time: DateTime!, $symbol: String!, $teamId: String!){
  bookEvent(groupSize: $groupSize, note: $note, masterPhoneNumber: $masterPhoneNumber, time: $time, symbol: $symbol, teamId: $teamId)
}`;

export const CLOSE_EVENT = gql`
mutation CloseEvent($eventId: String!){
  closeEvent(eventId: $eventId)
}`;

export const CANCEL_EVENT = gql`
mutation CancelEvent($eventId: String!){
  cancelEvent(eventId: $eventId)
}`;

export const DELETE_BUSINESS_HOUR = gql`
mutation DeleteBusinessHour($businessHourId: String!, $symbol: String!){
  deleteBusinessHour(businessHourId: $businessHourId, symbol: $symbol)
}`;

export const CREATE_BUSINESS_HOUR = gql`
mutation CreateBusinessHour($symbol: String!, $day: Int!, $open: Int!, $close: Int!){
  createBusinessHour(symbol: $symbol, day: $day, open: $open, close: $close)
}`;

export const SEND_TEAM_INVITATION = gql`
mutation SendTeamInvitation($email: String!, $teamId: String!){
  sendTeamInvitation(email: $email, teamId: $teamId)
}`;

export const UNDO_VOTE_POLL_LINEITEM = gql`
mutation UnvotePollLineItem($pollId: String!){
  unvotePollLineItem(pollId: $pollId)
}`;

export const VOTE_POLL_LINEITEM = gql`
mutation VotePollLineItem($pollLineItemId: String!){
  votePollLineItem(pollLineItemId: $pollLineItemId)
}`;

export const CREATE_POLL = gql`
mutation CreatePoll($expiration: DateTime!, $eventId: String!, $notify: Boolean!){
  createPoll(expiration: $expiration, eventId: $eventId, notify: $notify)
}`;

export const CREATE_EVENT = gql`
mutation CreateEvent($name: String!, $teamId: String!, $symbol: String, $notify: Boolean!){
  createEvent(name: $name, teamId: $teamId, symbol: $symbol, notify: $notify)
}`;

export const ADD_POLL_LINEITEM = gql`
mutation AddPollLineItem($pollId: String!, $symbol: String, $name: String, $time: String){
  addPollLineItem(pollId: $pollId, symbol: $symbol, name: $name, time: $time)
}`;

export const UPDATE_EVENT_NAME = gql`
mutation UpdateEventName($eventId: String!, $name: String!){
  updateEventName(eventId: $eventId, name: $name)
}`;

export const UPDATE_TEAM_NAME = gql`
mutation UpdateTeamName($teamId: String!, $name: String!){
  updateTeamName(teamId: $teamId, name: $name)
}`;

export const JOIN_TEAM = gql`
mutation JoinTeam($teamId: String!){
  joinTeam(teamId: $teamId)
}`;

export const CREATE_TEAM = gql`
mutation CreateTeam($name: String!){
  createTeam(name: $name)
}`;

export const QUIT_TEAM = gql`
mutation QuitTeam($teamId: String!){
  quitTeam(teamId: $teamId)
}`;

export const UPDATE_POLL = gql`
mutation UpdatePoll($pollId: String!, $expiration: DateTime!, $name: String){
  updatePoll(pollId: $pollId, expiration: $expiration, name: $name)
}`;

export const UPDATE_EVENT_TIME = gql`
mutation UpdateEventTime($eventId: String!, $time: DateTime!){
  updateEventTime(eventId: $eventId, time: $time)
}`;

export const UPDATE_EVENT_SYMBOL = gql`
mutation UpdateEventSymbol($eventId: String!, $symbol: String){
  updateEventSymbol(eventId: $eventId, symbol: $symbol)
}`;

export const REMOVE_POLL_LINEITEM = gql`
mutation RemovePollLineItem($pollLineItemId: String!){
  removePollLineItem(pollLineItemId: $pollLineItemId)
}`;

export const GET_AUTH_BY_GOOGLE_AUTH_CODE = gql`
mutation GetAuthByGoogleAuthCode($googleAuthCode: String!){
  getAuthByGoogleAuthCode(googleAuthCode: $googleAuthCode){
    email
    firstName
    lastName
    tokenHash
  }
}`;
