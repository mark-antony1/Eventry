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
import VenueDashboard from './pages/venue-dashboard';
import Event from './pages/event';
import Team from './pages/team';
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
          <Route component={withTracker(Event)} path="/event/:eventId" />
          <Route component={withTracker(Team)} path="/team/:teamId" />
          <Route exact component={withTracker(Details)} path="/:venueSymbol" />
          <Route exact component={withTracker(Booking)} path="/:venueSymbol/booking" />
          <Route component={withTracker(VenueDashboard)} path="/:venueSymbol/dashboard" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
