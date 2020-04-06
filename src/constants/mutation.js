import gql from 'graphql-tag';
import {
  User
} from './fragment';

export const CREATE_USER = gql`
mutation CreateUser($email: String!, $password: String!, $firstName: String!, $lastName: String!, $team: String!){
  createUser(email: $email, password: $password, firstName: $firstName, lastName: $lastName, team: $team){
    token
    user${User}
  }
}`;

export const CHANGE_PASSWORD = gql`
mutation ChangePassword($currentPassword: String!, $newPassword: String!){
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}`;

export const SIGN_IN = gql`
mutation Signin($email: String!, $password: String!){
  signin(email: $email, password: $password){
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
mutation BookEvent($groupSize: Int!, $note: String, $masterPhoneNumber: String!, $time: DateTime!, $symbol: String!){
  bookEvent(groupSize: $groupSize, note: $note, masterPhoneNumber: $masterPhoneNumber, time: $time, symbol: $symbol)
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
