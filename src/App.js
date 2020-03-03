import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import HeaderNavigation from './components/header-navigation';
import Discovery from './pages/discovery';
import Details from './pages/details';

import './App.css';

function App() {
  return (
    <Router>
      <div>
        <HeaderNavigation />
        <Switch>
          <Route exact component={Discovery} path="/" />
          <Route exact component={Details} path="/:venueSymbol" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
