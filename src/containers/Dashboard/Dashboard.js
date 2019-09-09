import React, { Component } from 'react';

import "./Dashboard.scss"

import {
    Switch,
    Route,
    Redirect
} from 'react-router-dom';

import {
    SyncList
} from "../../containers"



export default class Dashboard extends Component {

  render() {
      const {
          match,
      } = this.props;
    return (
      <div className="dashboard-container">
          <Switch>
              <Route exact path={ `${match.path}/syncs` } component={ SyncList } />
              <Redirect exact from="/dashboard" to="/dashboard/syncs" />
          </Switch>
      </div>
    );
  }
}