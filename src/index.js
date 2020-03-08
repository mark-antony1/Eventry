import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as StyletronProvider } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { BaseProvider, lightThemePrimitives, createTheme } from 'baseui';
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

ReactDOM.render(
  <StyletronProvider value={engine}>
    <BaseProvider theme={theme}>
      <App />
    </BaseProvider>
  </StyletronProvider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
