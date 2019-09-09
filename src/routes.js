import React from 'react';
import { Switch, Route } from 'react-router-dom';

import DashBoard from './containers/Dashboard/Dashboard';

// Define your routes here.
const routes = (
    <Switch>
      <Route path="/dashboard" component={DashBoard}/>
      <Route path="/" component={DashBoard}/>
    </Switch>);

export default routes;