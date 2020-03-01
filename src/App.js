import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import HeaderNavigation from './components/header-navigation';
import Discovery from './pages/discovery';

import './App.css';

function App() {
  return (
    <Router>
      <div>
        <HeaderNavigation />
        <Switch>
          <Route exact component={Discovery} path="/" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
