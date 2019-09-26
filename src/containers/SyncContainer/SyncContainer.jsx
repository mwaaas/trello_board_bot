import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { Route, Switch } from 'react-router-dom';

import { AddSyncContainer, EditSyncContainer } from '../../containers';
import { NotFound } from '../../components';
import './SyncContainer.scss';


export default class SyncContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    embedName: PropTypes.string,
  };

  render() {
    const { match, embedName } = this.props;

    const classNames = classnames('sync-container', {
      'sync-container--trello': embedName === 'trello',
    });
    return (
      <div className={ classNames }>
        <Switch>
          <Route exact path={ `${match.url}/add`} component={ AddSyncContainer } />
          <Route exact path={ `${match.url}/edit/:linkId` } component={ EditSyncContainer } />
          <Route component={ NotFound } />
        </Switch>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/SyncContainer/SyncContainer.jsx