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
