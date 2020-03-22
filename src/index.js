import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as StyletronProvider } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { BaseProvider, lightThemePrimitives, createTheme } from 'baseui';

import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient, ApolloLink } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from 'apollo-link-context';
import { onError } from "apollo-link-error";
import { getCookie } from './utils';

import './fonts/Helvetica400.ttf';
import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

const engine = new Styletron();
const customeTheme = {
  ...lightThemePrimitives,
  primaryFontFamily: 'Helvetica',
};
const theme = createTheme(customeTheme);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authLink = setContext(async (_, { headers }) => {
  const userToken = getCookie('userToken');
  return {
    headers: {
      ...headers,
      Authorization: userToken ? `Bearer ${userToken}` : "",
    }
  }
});

const cache = new InMemoryCache({});
const HTTP_LINK = createUploadLink({ uri: process.env.REACT_APP_TEAMBRIGHT_BACKEND_URI });
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, HTTP_LINK]),
  cache
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <StyletronProvider value={engine}>
      <BaseProvider theme={theme}>
        <App />
      </BaseProvider>
    </StyletronProvider>
  </ApolloProvider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
