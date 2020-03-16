import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import HeaderNavigation from './components/header-navigation';
import Discovery from './pages/discovery';
import Details from './pages/details';
import { withTracker } from './utils';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact component={withTracker(Discovery)} path="/" />
          <Route exact component={withTracker(Details)} path="/:venueSymbol" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
