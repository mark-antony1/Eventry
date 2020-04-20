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
import Privacy from './pages/privacy';
import Booking from './pages/booking';
import VenueDashboard from './pages/venue-dashboard';
import Event from './pages/event';
import Team from './pages/team';
import Home from './pages/home';
import CreateEvent from './pages/create-event';
import VirtualEventDiscovery from './pages/virtual-event-discovery';
import { withTracker } from './utils';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact component={withTracker(Home)} path="/" />
          <Route exact component={withTracker(Discovery)} path="/s" />
          <Route exact component={withTracker(VirtualEventDiscovery)} path="/v" />
          <Route exact component={withTracker(Privacy)} path="/privacy" />
          <Route exact component={withTracker(About)} path="/about" />
          <Route exact component={withTracker(User)} path="/user" />
          <Route component={withTracker(Event)} path="/event/:eventId" />
          <Route exact component={withTracker(CreateEvent)} path="/team/:teamId/create-event" />
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
