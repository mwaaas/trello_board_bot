import React from 'react';
import { Switch, Route } from 'react-router-dom';

import BoardBar from './pages/BoardBar';
import DashBoard from './pages/Dashboard';
import Section from './pages/Section';
import Settings from './pages/Settings';

// Define your routes here.
const routes = (<Switch>
  <Route path="/board-bar" component={BoardBar} />
  <Route path="/dashboard" component={DashBoard} />
  <Route path="/section" component={Section} />
  <Route path="/settings" component={Settings} />
</Switch>);

export default routes;