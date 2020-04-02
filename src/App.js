import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Discovery from './pages/discovery';
import Details from './pages/details';
import User from './pages/user';
import About from './pages/about';
import Booking from './pages/booking';
import { withTracker } from './utils';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact component={withTracker(Discovery)} path="/" />
          <Route exact component={withTracker(About)} path="/about" />
          <Route exact component={withTracker(User)} path="/user" />
          <Route exact component={withTracker(Details)} path="/:venueSymbol" />
          <Route exact component={withTracker(Booking)} path="/:venueSymbol/booking" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
