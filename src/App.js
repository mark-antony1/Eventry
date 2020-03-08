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

const NavRoute = ({exact, path, component: Component}) => (
  <Route exact={exact} path={path} render={(props) => (
    <div>
      <HeaderNavigation {...props} />
      <Component {...props}/>
    </div>
  )}/>
);

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <NavRoute exact component={Discovery} path="/" />
          <NavRoute exact component={Details} path="/:venueSymbol" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
