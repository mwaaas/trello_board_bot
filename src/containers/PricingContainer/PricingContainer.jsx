import React, { Component } from 'react';
import {
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import ProjectSyncPricing from './ProjectSyncPricing';
import TaskSyncPricing from './TaskSyncPricing';


export default class PricingContainer extends Component {
  render() {
    const { match } = this.props;

    return (
      <Switch>
        <Redirect exact from={ `${match.path}` } to={ `${match.path}/project-sync` } />
        <Route exact path={ `${match.path}/project-sync` } component={ ProjectSyncPricing } />
        { /* Route that is going to be used by the mirror PU to display Task Sync only plans */ }
        <Route exact path={ `${match.path}/task-sync` } component={ TaskSyncPricing } />
      </Switch>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/PricingContainer.jsx